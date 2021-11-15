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
import { calcNextValueTransfer, calcSkew, calcTokenPrice } from "..";

/**
 * Pool class constructor inputs.
 * Most values are optional, if no value is provided, the initiator will fetch
 * 	the information from the contract.
 * The only required inputs are an `address` and `rpcURL`
 */
export interface IPool {
    address: string;
	rpcURL: string;

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
		minimumCommitSize: number;
	}
    shortToken?: TokenInfo;
    longToken?: TokenInfo;
    quoteToken?: TokenInfo;
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
	provider: ethers.providers.JsonRpcProvider;

	_contract?: LeveragedPool;
	_keeper?: PoolKeeper;
	// these errors are because there is nothing initialised in constructor
	// @ts-expect-error is set in Create()
    name: string;
	// @ts-expect-error is set in Create()
    updateInterval: BigNumber;
	// @ts-expect-error is set in Create()
    frontRunningInterval: BigNumber;
	// @ts-expect-error is set in Create()
    leverage: number;
	// @ts-expect-error is set in Create()
    keeper: string;
	// @ts-expect-error is set in Create()
    committer: Committer;
	// @ts-expect-error is set in Create()
    shortToken: PoolToken;
	// @ts-expect-error is set in Create()
    longToken: PoolToken;
	// @ts-expect-error is set in Create()
    quoteToken: Token;
	// @ts-expect-error is set in Create()
    lastUpdate: BigNumber;
	// @ts-expect-error is set in Create()
    lastPrice: BigNumber;
	// @ts-expect-error is set in Create()
    shortBalance: BigNumber;
	// @ts-expect-error is set in Create()
    longBalance: BigNumber;

	// @ts-expect-error is set in Create()
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
	}

	/**
	 * Replacement constructor pattern to support async initialisations
	 * @param poolInfo {@link IPool| IPool interface props}
	 * @returns a Promise containing an initialised Pool class ready to be used
	 */
	public static Create: (poolInfo: IPool) => Promise<Pool> = async (poolInfo) => {
		const provider = new ethers.providers.JsonRpcProvider(poolInfo.rpcURL);
		const pool = new Pool(poolInfo.address, provider);
		await pool.init(poolInfo);
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
		const contract = new ethers.Contract(poolInfo.address, LeveragedPool__factory.abi, this.provider) as LeveragedPool;
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

		const shortToken = await PoolToken.Create({
			...poolInfo.shortToken,
			pool: this.address,
			address: shortTokenAddress,
			provider: this.provider,
		})
		this.shortToken = shortToken;

		const longToken = await PoolToken.Create({
			...poolInfo.longToken,
			pool: this.address,
			address: longTokenAddress,
			provider: this.provider,
		})
		this.longToken = longToken;

		const quoteToken = await Token.Create({
			...poolInfo.quoteToken,
			address: quoteTokenAddress,
			provider: this.provider,
		})
		this.quoteToken = quoteToken;

		const poolCommitter = await Committer.Create({
			address: committer,
			provider: this.provider,
			quoteTokenDecimals: quoteToken.decimals,
			...poolInfo.committer
		})
		this.committer = poolCommitter;

		const keeperInstance = new ethers.Contract(keeper, PoolKeeper__factory.abi, this.provider) as PoolKeeper;
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
	 * Calculates the resultant long and short balances as if an upkeep occured at t = now
	 * @returns the pools next long and short balances
	 */
	public getNextBalances: () => {
		nextLongBalance: BigNumber,
		nextShortbalance: BigNumber
	} = () => {
		const {
			longValueTransfer,
			shortValueTransfer
		} = this.getNextValueTransfer();
		return ({
			nextLongBalance: this.longBalance.plus(longValueTransfer).plus(this.committer.pendingLong.mint),
			nextShortbalance: this.shortBalance.plus(shortValueTransfer).plus(this.committer.pendingShort.mint),
		})
	}

	/**
	 * Calculates the pools current skew between long and short balances.
	 * This is the ratio between the long and short pools
	 * @returns the pool skew
	 */
	public getSkew: () => BigNumber = () => calcSkew(this.shortBalance, this.longBalance);

	/**
	 * Calculates the resultant skew as if an upkeep occured at t = now
	 * @returns the pool skew between long and short balances
	 */
	public getNextSkew: () => BigNumber = () => {
		const {
			nextLongBalance,
			nextShortbalance
		}= this.getNextBalances();
		return calcSkew(nextShortbalance, nextLongBalance)
	}

	/**
	 * Fetches and sets the pools long and short balances from the contract state
	 * @returns the fetched long and short balances
	 */
	public fetchPoolBalances: () => Promise<{
		longBalance: BigNumber,
		shortBalance: BigNumber,
	}> = async () => {
		if (!this._contract) {
			throw new Error("Failed to update pool balances: this._contract undefined")
		}
		const [
			longBalance_,
			shortBalance_
		] = await Promise.all([
			this._contract.longBalance(),
			this._contract.shortBalance(),
		])

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
			throw new Error("Failed to fetch the pools oracle price: this._contract undefined")
		}
		const price_ = await this._contract.getOraclePrice();
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
			throw new Error("Failed to fetch the pools last price: this._keeper undefined")
		}
		const price_ = await this._keeper.executionPrice(this.address);
		const price = new BigNumber(ethers.utils.formatEther(price_));
		this.setLastPrice(price)
		return price
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
}
