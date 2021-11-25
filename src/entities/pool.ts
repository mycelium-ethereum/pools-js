import BigNumber from "bignumber.js";
import Token, { TokenInfo } from "./token";
import { ethers } from 'ethers';
import {
    LeveragedPool__factory,
    LeveragedPool,
    PoolKeeper__factory,
    PoolKeeper,
} from '@tracer-protocol/perpetual-pools-contracts/types';
import PoolToken from "./poolToken";
import Committer from './committer';
import { calcNextValueTransfer, calcSkew, calcTokenPrice, SideEnum } from "..";

/**
 * Static pool info that can be passed in as props
 * Most is optional except the address, this is a requirement
 */
export interface StaticPoolInfo {
    address: string;
    name?: string;
	/**
	 * Update interaval (time between upkeeps) in seconds.
	 */
    updateInterval?: number; // in seconds
	/**
	 * Front running interaval in seconds.
	 * Time before the upkeep where no more commits are permitted
	 */
    frontRunningInterval?: number;
    leverage?: number;
    keeper?: string;
    committer?: {
		address: string;
		minimumCommitSize?: number;
	}
    shortToken?: TokenInfo;
    longToken?: TokenInfo;
    quoteToken?: TokenInfo;
}

/**
 * Pool class constructor inputs.
 * Most values are optional, if no value is provided, the initiator will fetch
 * 	the information from the contract.
 * The only required inputs are an `address` and `rpcURL`
 */
export interface IPool extends StaticPoolInfo {
	provider: ethers.providers.JsonRpcProvider;
} 

/**
 * LeveragedPool class initiated with an an `address` and an `rpcURL`.
 * Stores relevant LeveragedPool information.
 * It is optional for the user to provide additional pool information, reducing
 * 	the number of RPC calls. This optional info is static information
 * 	of the pool, such as names and addresses
 * The constructor is private so must be instantiated with {@linkcode Pool.Create}
 */
export default class Pool {
    address: string;
	provider: ethers.providers.JsonRpcProvider | ethers.providers.JsonRpcSigner;

	_contract?: LeveragedPool;
	_keeper?: PoolKeeper;
	// these errors are because there is nothing initialised in constructor
    name: string;
    updateInterval: BigNumber;
    frontRunningInterval: BigNumber;
    leverage: number;
    keeper: string;
    committer: Committer;
    shortToken: PoolToken;
    longToken: PoolToken;
    quoteToken: Token;
    lastUpdate: BigNumber;
    lastPrice: BigNumber;
    shortBalance: BigNumber;
    longBalance: BigNumber;
    oraclePrice: BigNumber;
	
	/**
	 * Private constructor to initialise a Pool instance
	 * @param address LeveragedPool contract address
	 * @param provider ethers RPC provider
	 * @private
	 */
	private constructor(address: string, provider: ethers.providers.JsonRpcProvider) {
		this.address = address;
		this.provider = provider;

		this.name = '';
		this.updateInterval = new BigNumber (0);
		this.frontRunningInterval = new BigNumber (0);
		this.leverage = 1;
		this.keeper = '';
		this.committer = Committer.CreateDefault();
		this.shortToken = PoolToken.CreateDefault();
		this.longToken = PoolToken.CreateDefault();
		this.quoteToken = Token.CreateDefault();
		this.lastUpdate = new BigNumber(0);
		this.lastPrice = new BigNumber(0);
		this.shortBalance = new BigNumber(0);
		this.longBalance = new BigNumber(0);
		this.oraclePrice = new BigNumber(0);
	}

	/**
	 * Replacement constructor pattern to support async initialisations
	 * @param poolInfo {@link IPool| IPool interface props}
	 * @returns a Promise containing an initialised Pool class ready to be used
	 */
	public static Create: (poolInfo: IPool) => Promise<Pool> = async (poolInfo) => {
		const pool = new Pool(poolInfo.address, poolInfo.provider);
		await pool.init(poolInfo);
		return pool;
	}

	/** 
	 * Creates an empty pool that can be used as a default
	 */
	public static CreateDefault: () => Pool = () => {
		const pool = new Pool('', new ethers.providers.JsonRpcProvider());
		return pool;
	}

	/**
	 * TODO
	 */
	public static DeployPool: () => void;

	/**
	 * Private initialisation function called in {@link Pool.Create}
	 * @private
	 * @param poolInfo {@link IPool | IPool interface props}
	 */
	private init: (poolInfo: IPool) => void = async (poolInfo) => {
		const contract = LeveragedPool__factory.connect(
			poolInfo.address,
			this.provider
		)
		this._contract = contract;
		
		const [lastUpdate, committer, keeper, updateInterval, frontRunningInterval, name] = await Promise.all([
			contract.lastPriceTimestamp(),
			poolInfo?.committer?.address ? poolInfo?.committer?.address : contract.poolCommitter(),
			poolInfo?.keeper ? poolInfo?.keeper : contract.keeper(),
			poolInfo?.updateInterval ? poolInfo?.updateInterval : contract.updateInterval(),
			poolInfo?.frontRunningInterval ? poolInfo?.frontRunningInterval : contract.frontRunningInterval(),
			poolInfo?.name ? poolInfo?.name : contract.poolName()
		]);

		const [longTokenAddress, shortTokenAddress, quoteTokenAddress] = await Promise.all([
			poolInfo.longToken?.address ? poolInfo.longToken?.address : contract.tokens(0),
			poolInfo.shortToken?.address ? poolInfo.shortToken?.address : contract.tokens(1),
			poolInfo.quoteToken?.address ? poolInfo?.quoteToken?.address : contract.quoteToken(),
		])

		const [shortToken, longToken, quoteToken] = await Promise.all(
			[
				PoolToken.Create({
					...poolInfo.shortToken,
					pool: this.address,
					address: shortTokenAddress,
					provider: this.provider,
					side: SideEnum.short
				}), PoolToken.Create({
					...poolInfo.longToken,
					pool: this.address,
					address: longTokenAddress,
					provider: this.provider,
					side: SideEnum.long
				}), Token.Create({
					...poolInfo.quoteToken,
					address: quoteTokenAddress,
					provider: this.provider,
				})
			]
		)
		this.shortToken = shortToken;
		this.longToken = longToken;
		this.quoteToken = quoteToken;

		const poolCommitter = await Committer.Create({
			address: committer,
			provider: this.provider,
			quoteTokenDecimals: quoteToken.decimals,
			...poolInfo.committer
		})
		this.committer = poolCommitter;

		const keeperInstance = PoolKeeper__factory.connect(keeper, this.provider)
		this._keeper = keeperInstance;

		await Promise.all([
			this.fetchPoolBalances(),
			this.fetchOraclePrice(),
			this.fetchLastPrice()
		])

		// temp fix since the fetched leverage is in IEEE 128 bit. Get leverage amount from name
		const leverage = parseInt(name.split('-')?.[0] ?? 1);

		this.name = name;
		this.keeper = keeper;
		this.updateInterval = new BigNumber(updateInterval);
		this.frontRunningInterval = new BigNumber(frontRunningInterval);
        this.lastUpdate = new BigNumber(lastUpdate.toString());

		this.leverage = leverage;
	}

	/**
	 * Calculates the pools next value transfer in quote token units (eg USD).
	 * Uses {@link getNextValueTransfer}.
	 * @returns and object containing short and long value transfer. 
	 * 	The values will be a negation of eachother but this way reads better than 
	 * 	returning a winning side as well as a value
	 */
	public getNextValueTransfer: () => {
		shortValueTransfer: BigNumber,
		longValueTransfer: BigNumber,
	}= () => (
		calcNextValueTransfer(this.lastPrice, this.oraclePrice, new BigNumber(this.leverage), this.longBalance, this.shortBalance)
	);

	/**
	 * Calculates and returns the long token price.
	 * Uses {@link calcTokenPrice}.
	 * @returns the long token price in quote token units (eg USD) 
	 */
	public getLongTokenPrice: () => BigNumber = () => (
		calcTokenPrice(this.longBalance, this.longToken.supply.plus(this.committer.pendingLong.burn))
	)

	/**
	 * Calculates and returns the short token price.
	 * Uses {@link calcTokenPrice}.
	 * @returns the long token price in quote token units (eg USD) 
	 */
	public getShortTokenPrice: () => BigNumber = () => (
		calcTokenPrice(this.shortBalance, this.shortToken.supply.plus(this.committer.pendingShort.burn))
	)

	/**
	 * Calculates and returns the long token price as if the rebalance occured at t = now.
	 * Uses {@link calcTokenPrice}.
	 * @returns the long token price in quote token units (eg USD) 
	 */
	public getNextLongTokenPrice: () => BigNumber = () => {
		// value transfer is +- 
		const {
			longValueTransfer	
		} = this.getNextValueTransfer();
		return calcTokenPrice(this.longBalance.plus(longValueTransfer), this.longToken.supply.plus(this.committer.pendingLong.burn))
	}

	/**
	 * Calculates and returns the short token price as if the rebalance occured at t = now.
	 * Uses {@link calcTokenPrice}.
	 * @returns the long token price in quote token units (eg USD) 
	 */
	public getNextShortTokenPrice: () => BigNumber = () => {
		// value transfer is +- 
		const {
			shortValueTransfer
		} = this.getNextValueTransfer();
		return calcTokenPrice(this.shortBalance.plus(shortValueTransfer), this.shortToken.supply.plus(this.committer.pendingShort.burn))
	}

	/**
	 * Calculates the resultant pool state as if an upkeep occured at t = now.
	 * Note: If you were to calculate the token price on these expected balances, 
	 * 	you would have to factor in the amount of new tokens minted from
	 * 	the pending mint commits. By factoring in the new tokens minted,
	 * 	you should arrive at the same token price given.
	 * @returns an object containing the pools expected long and short balances, 
	 * 	the expectedSkew, and the new token prices
	 */
	public getNextPoolState: () => {
		expectedLongBalance: BigNumber,
		expectedShortBalance: BigNumber,
		newLongTokenPrice: BigNumber,
		newShortTokenPrice: BigNumber,
		expectedSkew: BigNumber,
		valueTransfer: {
			longValueTransfer: BigNumber
			shortValueTransfer: BigNumber
		}
	} = () => {
		const valueTransfer = this.getNextValueTransfer();
		const newLongTokenPrice = this.getNextLongTokenPrice();
		const newShortTokenPrice = this.getNextShortTokenPrice();

		const netPendingLong = this.committer.pendingLong.mint.minus(this.committer.pendingLong.burn.times(newLongTokenPrice))
		const netPendingShort = this.committer.pendingShort.mint.minus(this.committer.pendingShort.burn.times(newShortTokenPrice))
		
		const expectedLongBalance = this.longBalance.plus(valueTransfer.longValueTransfer).plus(netPendingLong);
		const expectedShortBalance = this.shortBalance.plus(valueTransfer.shortValueTransfer).plus(netPendingShort);

		const expectedSkew = calcSkew(expectedShortBalance, expectedLongBalance);

		return ({
			expectedLongBalance, 
			expectedShortBalance,
			valueTransfer,
			newLongTokenPrice,
			newShortTokenPrice,
			expectedSkew 
		})
	}

	/**
	 * Calculates the pools current skew between long and short balances.
	 * This is the ratio between the long and short pools
	 * @returns the pool skew
	 */
	public getSkew: () => BigNumber = () => calcSkew(this.shortBalance, this.longBalance);

	/**
	 * Fetches and sets the pools long and short balances from the contract state
	 * @returns the fetched long and short balances
	 */
	public fetchPoolBalances: () => Promise<{
		longBalance: BigNumber,
		shortBalance: BigNumber,
	}> = async () => {
		if (!this._contract) {
			throw Error("Failed to update pool balances: this._contract undefined")
		}
		const [
			longBalance_,
			shortBalance_
		] = await Promise.all([
			this._contract.longBalance(),
			this._contract.shortBalance(),
		]).catch((error) => {
			throw Error("Failed to update pool balances: " + error?.message ?? error)
		})

        const shortBalance = new BigNumber(ethers.utils.formatUnits(shortBalance_, this.quoteToken.decimals));
        const longBalance = new BigNumber(ethers.utils.formatUnits(longBalance_, this.quoteToken.decimals));

		this.setLongBalance(longBalance);
		this.setShortBalance(shortBalance);

		return ({
			longBalance: longBalance,
			shortBalance: shortBalance
		})
	}

	/** 
	 * Sets and gets the most up to date oraclePrice
	 */
	public fetchOraclePrice: () => Promise<BigNumber> = async () => {
		if (!this._contract) {
			throw Error("Failed to fetch the pools oracle price: this._contract undefined")
		}
		const price_ = await this._contract.getOraclePrice().catch((error) => {
			throw Error("Failed to fetch pools oralce price: " + error?.message ?? error)
		});
		const price = new BigNumber(ethers.utils.formatEther(price_));
		this.setOraclePrice(price)
		return price
	}

	/** 
	 * Sets and gets the most up to date pool price.
	 * This is the price the pool used last upkeep 
	 */
	public fetchLastPrice: () => Promise<BigNumber> = async () => {
		if (!this._keeper) {
			throw Error("Failed to fetch pools last price: this._keeper undefined")
		}
		const price_ = await this._keeper.executionPrice(this.address).catch((error) => {
			throw Error("Failed to fetch pools last price: " + error?.message)
		});
		const price = new BigNumber(ethers.utils.formatEther(price_));
		this.setLastPrice(price)
		return price
	}

	/** 
	 * Sets and gets the most up to date pool price.
	 * This is the price the pool used last upkeep 
	 */
	public fetchLastPriceTimestamp: () => Promise<BigNumber> = async () => {
		if (!this._contract) {
			throw Error("Failed to fetch pools last price timestamp: this._contract undefined")
		}
		const timestamp_ = await this._contract?.lastPriceTimestamp().catch((error) => {
			throw Error("Failed to fetch pools last price timestamp: " + error?.message)
		});
		const timestamp = new BigNumber(timestamp_.toString());
		this.setLastPriceTimestamp(timestamp)
		return timestamp 
	}

	/**
	 * Replaces the provider and connects the contract instance, also connects the
	 * 	quoteToken, short and long tokens and Committer instance
	 * @param provider The new provider to connect to
	 */
	public connect: (provider: ethers.providers.JsonRpcProvider | ethers.providers.JsonRpcSigner) => void = (provider) => {
		if (!provider) {
			throw Error("Failed to connect LeveragedPool: provider cannot be undefined")
		}
		this.provider = provider;
		this._contract = this._contract?.connect(provider);
		this.committer.connect(provider);
		this.longToken.connect(provider);
		this.shortToken.connect(provider);
		this.quoteToken.connect(provider);
	}

	/**
	 * Sets the pools long balance
	 * @param longBalance balance to set
	 */
	public setLongBalance: (longBalance: BigNumber) => void = (longBalance) => {
		this.longBalance = longBalance;
	}

	/**
	 * Sets the pools short balance
	 * @param shortBalance balance to set
	 */
	public setShortBalance: (shortbalance: BigNumber) => void = (shortBalance) => {
		this.shortBalance = shortBalance;
	}

	/**
	 * Sets the pools oracle price
	 * @param price new price to set
	 */
	public setOraclePrice: (price: BigNumber) => void = (price) => {
		this.oraclePrice = price;
	}

	/**
	 * Sets the pools last price
	 * @param price new price to set
	 */
	public setLastPrice: (price: BigNumber) => void = (price) => {
		this.lastPrice = price;
	}
	/**
	 * Sets the pools last price
	 * @param price new price to set
	 */
	public setLastPriceTimestamp: (timestamp: BigNumber) => void = (timestamp) => {
		this.lastUpdate = timestamp;
	}
}
