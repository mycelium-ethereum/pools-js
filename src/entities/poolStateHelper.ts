
import { PoolStateHelper as PoolStateHelperTypeChain, PoolStateHelper__factory } from "../types/poolStateHelper";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { ethersBNtoBN } from "../utils";
import { IContract, TotalPoolCommitmentsBN } from "../types";

/**
 * Pool State Helper class constructor inputs
 */
export interface IPoolStateHelper extends IContract, _PoolStateHelper {}

/**
 * PoolStateHelper constructor props
 */
export interface _PoolStateHelper {
	address: string;
	poolAddress: string;
	committerAddress: string;
}

type ExpectedPoolState = {
	longSupply: BigNumber,
	longBalance: BigNumber,
	shortSupply: BigNumber,
	shortBalance: BigNumber,
	oraclePrice: BigNumber,
}

/**
 * PoolStateHelper class for interacting with on chain PoolStateHelper contracts
 * The constructor is private so must be instantiated with {@linkcode PoolStateHelper.Create}
 */
export default class PoolStateHelper {
	_contract?: PoolStateHelperTypeChain;
	address: string;
	poolAddress: string;
	committerAddress: string;
	fullCommitPeriod: number;
	provider: ethers.providers.Provider | ethers.Signer | undefined;

	/**
	 * @private
	 */
	private constructor () {
		this.address = '';
		this.poolAddress = '';
		this.committerAddress = '';
		this.fullCommitPeriod = 1;
		this.provider = undefined;
	}

	/**
	 * Replacement constructor pattern to support async initialisations
	 * @param tokenINfo {@link IPoolStateHelper | IPoolStateHelper interface props}
	 * @returns a Promise containing an initialised PoolStateHelper class ready to be used
	 */
	public static Create: (config: IPoolStateHelper) => Promise<PoolStateHelper> = async (config) => {
		const poolStateHelper = new PoolStateHelper();
		// initialise the poolStateHelper;
		await poolStateHelper.init(config);
		return poolStateHelper;
	}

	/**
	 * Creates an empty PoolStateHelper that can be used as a default
	 * @returns default constructed poolStateHelper
	 */
	public static CreateDefault: () => PoolStateHelper = () => {
		const poolStateHelper = new PoolStateHelper();
		return poolStateHelper;
	}

	/**
	 * Private initialisation function called in {@link PoolStateHelper.Create}
	 * @private
	 * @param config {@link IPoolStateHelper | IPoolStateHelper interface props}
	 */
	private init: (config: IPoolStateHelper) => Promise<void> = async (config) => {
		this.provider = config.provider;
		this.address = config.address;
		this.poolAddress = config.poolAddress;
		this.committerAddress = config.committerAddress;

		const contract = PoolStateHelper__factory.connect(
			config.address,
			config.provider
		);
		this._contract = contract;

		const fullCommitPeriod = await contract.fullCommitPeriod(config.poolAddress);
		this.fullCommitPeriod = fullCommitPeriod.toNumber();
	}

	/**
	 * Replaces the provider and connects the contract instance
	 * @param provider The new provider to connect to
	 */
	public connect: (provider: ethers.providers.Provider | ethers.Signer) => void = (provider) => {
		if (!provider) {
			throw Error("Failed to connect PoolStateHelper: provider cannot be undefined")
		}
		this.provider = provider;
		this._contract = this._contract?.connect(provider);
	}

	public getExpectedPoolState: (args: { periods: number }) => Promise<ExpectedPoolState> = async ({ periods }) => {
		if (!this._contract) {
			throw Error("Failed to fetch expected pool state: Contract not defined");
		}

		if (!this.poolAddress) {
			throw Error("Failed to fetch expected pool state: poolAddress not set");
		}

		const expectedState = await this._contract.getExpectedState(this.poolAddress, periods);

		return {
			longSupply: ethersBNtoBN(expectedState.longSupply),
			longBalance: ethersBNtoBN(expectedState.longBalance),
			shortSupply: ethersBNtoBN(expectedState.shortSupply),
			shortBalance: ethersBNtoBN(expectedState.shortBalance),
			// oracle wrapper formats price to decimal places
			// pool state helper leaves oracle price in wad, format here to be consistent with
			oraclePrice: new BigNumber(ethers.utils.formatEther(expectedState.oraclePrice)),
		}
	}

	public getCommitQueue: (args: { periods: number }) => Promise<TotalPoolCommitmentsBN[]> = async ({
		periods
	}) => {
		if (!this._contract) {
			throw Error("Failed to commit queue: Contract not defined");
		}

		if (!this.poolAddress) {
			throw Error("Failed to commit queue: poolAddress not set");
		}

		if (!this.committerAddress) {
			throw Error("Failed to commit queue: committerAddress not set");
		}

		const commitQueue = await this._contract.getCommitQueue(this.committerAddress, periods);

		return commitQueue.map(totalPoolCommitment => ({
			longMintSettlement: ethersBNtoBN(totalPoolCommitment.longMintSettlement),
			longBurnPoolTokens: ethersBNtoBN(totalPoolCommitment.longBurnPoolTokens),
			shortMintSettlement: ethersBNtoBN(totalPoolCommitment.shortMintSettlement),
			shortBurnPoolTokens: ethersBNtoBN(totalPoolCommitment.shortBurnPoolTokens),
			shortBurnLongMintPoolTokens: ethersBNtoBN(totalPoolCommitment.shortBurnLongMintPoolTokens),
			longBurnShortMintPoolTokens: ethersBNtoBN(totalPoolCommitment.longBurnShortMintPoolTokens),
		}))
	}
}
