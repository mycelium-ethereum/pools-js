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
import { calcNextValueTransfer, calcTokenPrice } from "..";

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
	 * Private initialisation function called in {@link Pool.Create}
	 * @private
	 * @param poolInfo {@link IPool | IPool interface props}
	 */
	private init: (poolInfo: IPool) => void = async (poolInfo) => {
		const contract = new ethers.Contract(poolInfo.address, LeveragedPool__factory.abi, this.provider) as LeveragedPool;
		const [lastUpdate, shortBalance, longBalance, oraclePrice, committer, keeper, updateInterval, frontRunningInterval, name] = await Promise.all([
			contract.lastPriceTimestamp(),
			contract.shortBalance(),
			contract.longBalance(),
			contract.getOraclePrice(),
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

		// fetch short and long token info if non is provided
		const shortToken = await PoolToken.Create({
			...poolInfo.shortToken,
			pool: this.address,
			address: shortTokenAddress,
			provider: this.provider,
		})

		const longToken = await PoolToken.Create({
			...poolInfo.longToken,
			pool: this.address,
			address: longTokenAddress,
			provider: this.provider,
		})

		const quoteToken = await Token.Create({
			...poolInfo.quoteToken,
			address: quoteTokenAddress,
			provider: this.provider,
		})

		// fetch minimum commit size
		const poolCommitter = await Committer.Create({
			address: committer,
			provider: this.provider,
			quoteTokenDecimals: quoteToken.decimals,
			...poolInfo.committer
		})

		// fetch last keeper price
		const keeperInstance = new ethers.Contract(keeper, PoolKeeper__factory.abi, this.provider) as PoolKeeper;
		const lastPrice = await keeperInstance.executionPrice(this.address);

		const quoteTokenDecimals = quoteToken.decimals;

		// temp fix since the fetched leverage is in IEEE 128 bit. Get leverage amount from name
		const leverage = parseInt(name.split('-')?.[0] ?? 1);

		// should be 13 things here
		this.name = name;
		this.keeper = keeper;
		this.updateInterval = new BigNumber(updateInterval);
		this.frontRunningInterval = new BigNumber(frontRunningInterval);
        this.lastUpdate = new BigNumber(lastUpdate.toString());
        this.lastPrice = new BigNumber(ethers.utils.formatEther(lastPrice));
        this.shortBalance = new BigNumber(ethers.utils.formatUnits(shortBalance, quoteTokenDecimals));
        this.longBalance = new BigNumber(ethers.utils.formatUnits(longBalance, quoteTokenDecimals));
        this.oraclePrice = new BigNumber(ethers.utils.formatEther(oraclePrice));
		this.leverage = leverage;

		this.committer = poolCommitter;

		this.shortToken = shortToken;
		this.longToken = longToken;
		this.quoteToken = quoteToken;
	}

	/**
	 * Calculates the pools next value transfer in quote token units (eg USD).
	 * Uses {@link calcNextValueTransfer}.
	 * @returns and object containing short and long value transfer. 
	 * 	The values will be a negation of eachother but this way reads better than 
	 * 	returning a winning side as well as a value
	 */
	public calcNextValueTransfer: () => {
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
	public calcLongTokenPrice: () => BigNumber = () => (
		calcTokenPrice(this.longBalance, this.longToken.supply.plus(this.committer.pendingLong.burn))
	)

	/**
	 * Calculates and returns the short token price.
	 * Uses {@link calcTokenPrice}.
	 * @returns the long token price in quote token units (eg USD) 
	 */
	public calcShortTokenPrice: () => BigNumber = () => (
		calcTokenPrice(this.shortBalance, this.shortToken.supply.plus(this.committer.pendingShort.burn))
	)

	/**
	 * Calculates and returns the long token price as if the rebalance occured at t = now.
	 * Uses {@link calcTokenPrice}.
	 * @returns the long token price in quote token units (eg USD) 
	 */
	public calcNextLongTokenPrice: () => BigNumber = () => {
		// value transfer is +- 
		const {
			longValueTransfer	
		} = this.calcNextValueTransfer();
		return calcTokenPrice(this.longBalance.plus(longValueTransfer), this.longToken.supply.plus(this.committer.pendingLong.burn))
	}

	/**
	 * Calculates and returns the short token price as if the rebalance occured at t = now.
	 * Uses {@link calcTokenPrice}.
	 * @returns the long token price in quote token units (eg USD) 
	 */
	public calcNextShortTokenPrice: () => BigNumber = () => {
		// value transfer is +- 
		const {
			shortValueTransfer
		} = this.calcNextValueTransfer();
		return calcTokenPrice(this.shortBalance.plus(shortValueTransfer), this.shortToken.supply.plus(this.committer.pendingShort.burn))
	}
}
