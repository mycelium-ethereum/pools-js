import BigNumber from "bignumber.js";
import Token, { TokenInfo } from "./token";
import { ethers } from 'ethers';
import {
    LeveragedPool__factory,
    LeveragedPool,
    PoolKeeper__factory,
    PoolKeeper,
		PoolSwapLibrary__factory,
		PoolSwapLibrary,
} from '@tracer-protocol/perpetual-pools-contracts/types';
import PoolToken from "./poolToken";
import Committer from './committer';
import { calcNextValueTransfer, calcSkew, calcTokenPrice, calcPoolStatePreview, SideEnum } from "..";
import { OraclePriceTransformer, PoolStatePreview, TotalPoolCommitmentsBN } from "../types";
import { ethersBNtoBN, movingAveragePriceTransformer, pendingCommitsToBN } from "../utils";
import { poolSwapLibraryByNetwork } from "../data/poolSwapLibraries";


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
    fee?: string; // percentage decimal in wei eg 1 * 10 ^18 === 100% 
    keeper?: string;
    committer?: {
			address: string;
		}
    shortToken?: TokenInfo;
    longToken?: TokenInfo;
    settlementToken?: TokenInfo;
}

/**
 * Pool class constructor inputs.
 * Most values are optional, if no value is provided, the initiator will fetch
 * 	the information from the contract.
 * The only required inputs are an `address` and `rpcURL`
 */
export interface IPool extends StaticPoolInfo {
	provider: ethers.providers.JsonRpcProvider;
	oraclePriceTransformer?: OraclePriceTransformer;
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
	provider: ethers.providers.Provider | ethers.Signer | undefined
	chainId: number | undefined

	_contract?: LeveragedPool;
	_keeper?: PoolKeeper;
	// these errors are because there is nothing initialised in constructor
	name: string;
	updateInterval: BigNumber;
	frontRunningInterval: BigNumber;
	leverage: number;
    fee: BigNumber; // percentage decimal in wei eg 1 * 10 ^18 === 100% 
	keeper: string;
	committer: Committer;
	poolSwapLibrary: PoolSwapLibrary | undefined;
	shortToken: PoolToken;
	longToken: PoolToken;
	settlementToken: Token;
	lastUpdate: BigNumber;
	lastPrice: BigNumber;
	shortBalance: BigNumber;
	longBalance: BigNumber;
	oraclePrice: BigNumber;
	oraclePriceTransformer: OraclePriceTransformer;

	/**
	 * Private constructor to initialise a Pool instance
	 * @param address LeveragedPool contract address
	 * @param provider ethers RPC provider
	 * @private
	 */
	private constructor() {
		this.address = '';
		this.provider = undefined;
		this.chainId = undefined;

		this.name = '';
		this.updateInterval = new BigNumber (0);
		this.frontRunningInterval = new BigNumber (0);
		this.fee = new BigNumber(0);
		this.leverage = 1;
		this.keeper = '';
		this.committer = Committer.CreateDefault();
		this.shortToken = PoolToken.CreateDefault();
		this.longToken = PoolToken.CreateDefault();
		this.settlementToken = Token.CreateDefault();
		this.lastUpdate = new BigNumber(0);
		this.lastPrice = new BigNumber(0);
		this.shortBalance = new BigNumber(0);
		this.longBalance = new BigNumber(0);
		this.oraclePrice = new BigNumber(0);

		// default to simple moving average, can be overridden in `Create`
		this.oraclePriceTransformer = movingAveragePriceTransformer;
	}

	/**
	 * Replacement constructor pattern to support async initialisations
	 * @param poolInfo {@link IPool| IPool interface props}
	 * @returns a Promise containing an initialised Pool class ready to be used
	 */
	public static Create: (poolInfo: IPool) => Promise<Pool> = async (poolInfo) => {
		const pool = new Pool();
		await pool.init(poolInfo);
		return pool;
	}

	/**
	 * Creates an empty pool that can be used as a default
	 */
	public static CreateDefault: () => Pool = () => {
		// trick typescript to take undefined
		const pool = new Pool();
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
	private init: (poolInfo: IPool) => Promise<void> = async (poolInfo) => {
		this.address = poolInfo.address;
		this.provider = poolInfo.provider;
		const contract = LeveragedPool__factory.connect(
			poolInfo.address,
			poolInfo.provider
		)
		this._contract = contract;

		const [lastUpdate, committer, keeper, updateInterval, frontRunningInterval, name, fee] = await Promise.all([
			contract.lastPriceTimestamp(),
			poolInfo?.committer?.address ? poolInfo?.committer?.address : contract.poolCommitter(),
			poolInfo?.keeper ? poolInfo?.keeper : contract.keeper(),
			poolInfo?.updateInterval ? poolInfo?.updateInterval : contract.updateInterval(),
			poolInfo?.frontRunningInterval ? poolInfo?.frontRunningInterval : contract.frontRunningInterval(),
			poolInfo?.name ? poolInfo?.name : contract.poolName(),
			poolInfo?.fee && parseInt(ethers.utils.formatEther(poolInfo.fee)) <= 1 ? poolInfo?.fee : contract.fee() // passed fee cant be over 100%
		]);

		this.fee = new BigNumber(ethers.utils.formatEther(fee));

		const network = await this.provider.getNetwork()
		this.chainId = network.chainId;
		if(poolInfo?.leverage) {
			this.leverage = poolInfo.leverage
		} else if(!poolSwapLibraryByNetwork[this.chainId]) {
			// temp fix since the fetched leverage is in IEEE 128 bit. Get leverage amount from name
			this.leverage = parseInt(name.split('-')?.[0] ?? 1);
		} else {
			try {
				const poolSwapLibrary = PoolSwapLibrary__factory.connect(
					poolSwapLibraryByNetwork[this.chainId],
					this.provider
				)

				const leverageAmountBytes = await contract.leverageAmount();
				const convertedLeverage = await poolSwapLibrary.convertDecimalToUInt(leverageAmountBytes);

				this.leverage = convertedLeverage.toNumber();
			} catch (error) {
				this.leverage = parseInt(name.split('-')?.[0] ?? 1);
			}
		}

		const [longTokenAddress, shortTokenAddress, settlementTokenAddress] = await Promise.all([
			poolInfo.longToken?.address ? poolInfo.longToken?.address : contract.tokens(0),
			poolInfo.shortToken?.address ? poolInfo.shortToken?.address : contract.tokens(1),
			poolInfo.settlementToken?.address ? poolInfo?.settlementToken?.address : contract.settlementToken()
		])

		const [shortToken, longToken, settlementToken] = await Promise.all(
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
					...poolInfo.settlementToken,
					address: settlementTokenAddress,
					provider: this.provider,
				})
			]
		)
		this.shortToken = shortToken;
		this.longToken = longToken;
		this.settlementToken = settlementToken;

		const poolCommitter = await Committer.Create({
			address: committer,
			provider: this.provider,
			settlementTokenDecimals: settlementToken.decimals,
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

		this.name = name;
		this.keeper = keeper;
		this.updateInterval = new BigNumber(updateInterval);
		this.frontRunningInterval = new BigNumber(frontRunningInterval);
		this.lastUpdate = new BigNumber(lastUpdate.toString());
		this.oraclePriceTransformer = poolInfo.oraclePriceTransformer ?? movingAveragePriceTransformer
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
	}= () => {
		const longBalanceAfterFee = this.longBalance.minus(this.longBalance.times(this.fee))
		const shortBalanceAfterFee = this.shortBalance.minus(this.longBalance.times(this.fee))
		return calcNextValueTransfer(this.lastPrice, this.oraclePrice, new BigNumber(this.leverage), longBalanceAfterFee, shortBalanceAfterFee)
	};

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
		const longBalanceAfterFee = this.longBalance.minus(this.fee.times(this.shortBalance));
		return calcTokenPrice(longBalanceAfterFee.plus(longValueTransfer), this.longToken.supply.plus(this.committer.pendingLong.burn))
	}

	/**
	 * Calculates and returns the short token price as if the rebalance occured at t = now.
	 * Uses {@link calcTokenPrice}.
	 * @returns the long token price in quote token units (eg USD)
	 */
	public getNextShortTokenPrice: () => BigNumber = () => {
		// value transfer is +-
		const {
			shortValueTransfer,
		} = this.getNextValueTransfer();
		const shortBalanceAfterFee = this.shortBalance.minus(this.fee.times(this.shortBalance));
		return calcTokenPrice(shortBalanceAfterFee.plus(shortValueTransfer), this.shortToken.supply.plus(this.committer.pendingShort.burn))
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

        const shortBalance = new BigNumber(ethers.utils.formatUnits(shortBalance_, this.settlementToken.decimals));
        const longBalance = new BigNumber(ethers.utils.formatUnits(longBalance_, this.settlementToken.decimals));

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
	 * get all total pool commitments between now and `now + frontRunningInterval`
	 * @returns promise resolving to an array of `TotalPoolCommitmentsBN`s
	 */
	public getPendingCommitsInFrontRunningInterval: () => Promise<TotalPoolCommitmentsBN[]> = async() => {
		if(!this.committer._contract) {
			throw Error("Failed to fetch pending commits in front running interval: this.committer._contract undefined")
		}

		const updateIntervalId = (await this.committer._contract.updateIntervalId()).toNumber()

    if (this.frontRunningInterval.lt(this.updateInterval)) {
      // simple case, commits will be executed either in next upkeep
			// or one after if committed within the front running interval

			const pendingCommitsThisInterval = await this.committer._contract.totalPoolCommitments(updateIntervalId);
			return [pendingCommitsToBN(pendingCommitsThisInterval)];
    }

    const upkeepsPerFrontRunningInterval = Math.floor(this.frontRunningInterval.div(this.updateInterval).toNumber());
    const pendingCommitPromises: Promise<TotalPoolCommitmentsBN>[] = [];

    // the last update interval that will be executed in the frontrunning interval as of now
    const maxIntervalId = updateIntervalId + upkeepsPerFrontRunningInterval;

    for (let i = updateIntervalId; i <= maxIntervalId; i++) {
			pendingCommitPromises.push(
				this.committer._contract.totalPoolCommitments(i)
				.then(totalPoolCommitments => pendingCommitsToBN(totalPoolCommitments))
			)
    }

    return Promise.all(pendingCommitPromises);
	}

	/**
	 * get total pool commitments between now and `now + updateInterval`
	 * @returns promise resolving to a `TotalPoolCommitmentsBN` object
	 */
	public getPendingCommitsInUpdateInterval: () => Promise<TotalPoolCommitmentsBN> = async() => {
		if(!this.committer._contract) {
			throw Error("Failed to fetch pending commits in update interval: this.committer._contract undefined")
		}

		const updateIntervalId = (await this.committer._contract.updateIntervalId()).toNumber()

		const pendingCommitsThisInterval = await this.committer._contract.totalPoolCommitments(updateIntervalId);
		return pendingCommitsToBN(pendingCommitsThisInterval);
	}

	/**
	 *
	 * @param atEndOf whether to fetch preview for end of update interval or front running interval
	 * @param forceRefreshInputs if `true`, will refresh
	 * `this.longBalance`,
	 * `this.shortBalance`,
	 * `this.longToken.supply`,
	 * `this.shortToken.supply`,
	 * `this.lastPrice` and `this.oraclePrice` before calculating pool state preview
	 * @returns
	 */
	public getPoolStatePreview: (
		atEndOf: 'frontRunningInterval' | 'updateInterval',
		forceRefreshInputs?: boolean,
	) => Promise<PoolStatePreview> = async (atEndOf, forceRefreshInputs) => {
		if(!this.committer._contract) {
			throw Error("Failed to get pool state preview after front running interval: this.committer._contract undefined")
		}
		const [
			longBalance,
			shortBalance
		] = await Promise.all([
			forceRefreshInputs ? (await this.fetchPoolBalances()).longBalance : this.longBalance,
			forceRefreshInputs ? (await this.fetchPoolBalances()).longBalance : this.shortBalance,
		])

		const [
			pendingCommits,
			pendingLongTokenBurn,
			pendingShortTokenBurn,
			longTokenSupply,
			shortTokenSupply,
			lastPrice,
			oraclePrice
		] = await Promise.all([
			atEndOf === 'frontRunningInterval' ?
				this.getPendingCommitsInFrontRunningInterval() :
				[(await this.getPendingCommitsInUpdateInterval())],
			this.committer._contract.pendingLongBurnPoolTokens(),
			this.committer._contract.pendingShortBurnPoolTokens(),
			forceRefreshInputs ? this.longToken.fetchSupply() : this.longToken.supply,
			forceRefreshInputs ? this.shortToken.fetchSupply() : this.shortToken.supply,
			forceRefreshInputs ? this.fetchLastPrice() : this.lastPrice,
			forceRefreshInputs ? this.fetchOraclePrice() : this.oraclePrice,
		])


		const poolStatePreview = calcPoolStatePreview({
			leverage: new BigNumber(this.leverage),
			fee: this.fee,
			longBalance,
			shortBalance,
			longTokenSupply: longTokenSupply,
			shortTokenSupply: shortTokenSupply,
			pendingLongTokenBurn: ethersBNtoBN(pendingLongTokenBurn),
			pendingShortTokenBurn: ethersBNtoBN(pendingShortTokenBurn),
			lastOraclePrice: lastPrice,
			currentOraclePrice: oraclePrice,
			pendingCommits,
			oraclePriceTransformer: this.oraclePriceTransformer
		});

		return poolStatePreview;
	}

	/**
	 * Replaces the provider and connects the contract instance, also connects the
	 * 	settlementToken, short and long tokens and Committer instance
	 * @param provider The new provider to connect to
	 */
	public connect: (provider: ethers.providers.Provider | ethers.Signer) => void = (provider) => {
		if (!provider) {
			throw Error("Failed to connect LeveragedPool: provider cannot be undefined")
		}
		this.provider = provider;
		this._contract = this._contract?.connect(provider);
		this.committer.connect(provider);
		this.longToken.connect(provider);
		this.shortToken.connect(provider);
		this.settlementToken.connect(provider);
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
