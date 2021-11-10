import BigNumber from "bignumber.js";
import { StaticTokenInfo, Token } from "./token";
import { ethers } from 'ethers';
import {
    LeveragedPool__factory,
    LeveragedPool,
    PoolKeeper__factory,
    PoolKeeper,
} from '@tracer-protocol/perpetual-pools-contracts/types';
import { PoolToken } from "./poolToken";
import { Committer } from './committer';

interface IPool {
	// address is the only mandatory props
    address: string;
	rpcURL: string;

    name?: string;
    updateInterval?: number; // in seconds
    frontRunningInterval?: number; // in seconds
    leverage?: number;
    keeper?: string;
    committer?: {
		address: string;
		minimumCommitSize: number;
	}
    shortToken?: StaticTokenInfo;
    longToken?: StaticTokenInfo;
    quoteToken?: StaticTokenInfo;
}

export class Pool {
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
    // nextShortBalance: BigNumber;
    // nextLongBalance: BigNumber;

	// @ts-expect-error is set in Create()
    oraclePrice: BigNumber;
	
	private constructor(address: string, provider: ethers.providers.JsonRpcProvider) {
		this.address = address;
		this.provider = provider;
	}

	public static Create: (poolInfo: IPool) => Promise<Pool> = async (poolInfo) => {
		const provider = new ethers.providers.JsonRpcProvider(poolInfo.rpcURL);
		const pool = new Pool(poolInfo.address, provider);
		await pool.init(poolInfo);
		return pool;
	}

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
}
