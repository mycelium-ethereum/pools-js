import { PoolCommitter, PoolCommitter__factory } from "@tracer-protocol/perpetual-pools-contracts/types";
import BigNumber from "bignumber.js";
import { providers as MCProvider } from '@0xsequence/multicall';
import { ethers } from "ethers";
import { CommitEnum, IContract, PendingAmounts } from "../types";
import { encodeCommitParams } from "../utils/helpers";

/**
 * PoolCommitter class constructor inputs
 */
export interface IPoolCommitter extends IContract {
	settlementTokenDecimals: number;
}

export const defaultCommitter = {
	pendingLong: {
		mint: new BigNumber(0),
		burn: new BigNumber(0),
	},
	pendingShort: {
		mint: new BigNumber(0),
		burn: new BigNumber(0),
	},
	settlementTokenDecimals: 18,
	mintingFee: new BigNumber(0),
	burningFee: new BigNumber(0),
} as const

/**
 * Interface for interacting with the PoolComitter.
 * Can be used standalone, but is always initialised within a
 * 	{@linkcode Pool}
 * The constructor is private so must be instantiated with {@linkcode Committer.Create}
 */
export default class Committer {
	_contract?: PoolCommitter;
	address: string;
	provider: ethers.providers.Provider | ethers.Signer | undefined;
	multicallProvider: MCProvider.MulticallProvider | ethers.Signer | undefined;
	settlementTokenDecimals: number;
	// decimal percentages
	mintingFee: BigNumber;
	burningFee: BigNumber;
	pendingLong: PendingAmounts;
	pendingShort: PendingAmounts;

	private constructor() {
		// these all need to be ovverridden in the init function
		this.address = '';
		this.provider = undefined;
		this.multicallProvider = undefined;
		this.pendingLong = {
			...defaultCommitter.pendingLong
		}
		this.pendingShort = {
			...defaultCommitter.pendingShort
		}
		this.settlementTokenDecimals = defaultCommitter.settlementTokenDecimals;
		this.mintingFee = defaultCommitter.mintingFee;
		this.burningFee = defaultCommitter.burningFee;
	}

	/**
	 * Replacement constructor pattern to support async initialisations
	 * @param committerInfo {@link IPoolCommitter | IPoolCommitter interface props}
	 * @returns a Promise containing an initialised Committer class ready to be used
	 */
	public static Create: (committerInfo: IPoolCommitter) => Promise<Committer> = async (committerInfo) => {
		const committer = new Committer();
		// initialise the token;
		await committer.init(committerInfo);
		return committer;
	}

	/**
	 * Creates an empty committer that can be used as a default
	 */
	public static CreateDefault: () => Committer = () => {
		const committer = new Committer();
		return committer;
	}

	/**
	 * Private initialisation function called in {@link Committer.Create}
	 * @param committerInfo {@link IPoolCommitter | IPoolCommitter interface props}
	 */
	private init: (commitInfo: IPoolCommitter) => Promise<void> = async (commitInfo) => {
		this.provider = commitInfo.provider;
		this.multicallProvider = new MCProvider.MulticallProvider(
			commitInfo.provider as ethers.providers.Provider
		);
		this.address = commitInfo.address;
		this.settlementTokenDecimals = commitInfo.settlementTokenDecimals;

		const contract = PoolCommitter__factory.connect(
			commitInfo.address,
			this.multicallProvider,
		)
		this._contract = contract;

		try {
			const [
				mintingFee,
				burningFee,
				{ pendingLong, pendingShort },
			] = await Promise.all([
				this._contract.getMintingFee(),
				this._contract.getBurningFee(),
				this.fetchAllShadowPools()
			])
			this.mintingFee = new BigNumber(ethers.utils.formatEther(mintingFee));
			this.burningFee = new BigNumber(ethers.utils.formatEther(burningFee));
			this.pendingShort = pendingShort;
			this.pendingLong = pendingLong;
		} catch (error) {
			throw Error(
				"Failed to initialise committer: " + error
			)
		}
	}

	/**
	 * Submits a commit
	 * @param type 1 of 4 commit types. These values are (0, 1, 2, 3) => (shortMint, shortBurn, longMint, longBurn)
	 * @param amount either a number or BigNumber representing the amount of tokens
	 * @param payForClaim
	 * @param fromAggregateBalances is true when the user wants to pay from balances yet to be claimed,
	 *	false if they want to use the balances within their wallet
	 * 	to be committed if burning, or the amount of quote token to use to mint new tokens
	 */
	public commit: (
		type: CommitEnum,
		amount: number | BigNumber,
		payForClaim: boolean,
		fromAggregateBalances: boolean
	) => Promise<ethers.ContractTransaction> = (type, amount, payForClaim, fromAggregateBalances) => {
		if (!this._contract) throw Error("Failed to commit: this._contract undefined")
		return this._contract.commit(
			encodeCommitParams(
				payForClaim,
				fromAggregateBalances,
				type,
				ethers.utils.parseUnits(amount.toString(), this.settlementTokenDecimals)
			)
		)
	}


	/**
	 * Updates all shadow pool balances.
	 * Calls {@linkcode Committer.fetchShadowPool} for each of the commit types.
	 * As such this will also set the internal state of the Class
	 * @returns all refetched shadow pool balances
	 */
	public fetchAllShadowPools: () => Promise<{
		pendingLong: PendingAmounts,
		pendingShort: PendingAmounts,
	}> = async () => {
		if (!this._contract) throw Error("Failed to update pending amounts: this._contract undefined")

		// current update interval
		const updateInterval = await this._contract.updateIntervalId();

		const [
			[
				pendingLongMintSettlement,
				// eslint-disable-next-line
				_, // pendingLongBurnTokens
				pendingShortMintSettlement
			],
			pendingLongBurnTokens,
			pendingShortBurnTokens,
		] = await Promise.all([
			this._contract.totalPoolCommitments(updateInterval),
			this._contract.pendingLongBurnPoolTokens(),
			this._contract.pendingShortBurnPoolTokens(),
		]).catch((error) => {
			throw Error("Failed to update pending amounts: " + error?.message)
		})

		const decimals = this.settlementTokenDecimals;

		return ({
			pendingLong: {
				mint: new BigNumber(ethers.utils.formatUnits(pendingLongMintSettlement ?? 0, decimals)),
				burn: new BigNumber(ethers.utils.formatUnits(pendingLongBurnTokens ?? 0, decimals))
			},
			pendingShort: {
				mint: new BigNumber(ethers.utils.formatUnits(pendingShortMintSettlement ?? 0, decimals)),
				burn: new BigNumber(ethers.utils.formatUnits(pendingShortBurnTokens ?? 0, decimals))
			}
		})
	}

	/**
	 * Replaces the provider and connects the contract instance
	 * @param provider The new provider to connect to
	 */
	public connect: (provider: ethers.providers.Provider | ethers.Signer) => void = (provider) => {
		if (!provider) {
			throw Error("Failed to connect Committer: provider cannot be undefined")
		}
		this.provider = provider;
		this.multicallProvider = new MCProvider.MulticallProvider(
			provider as ethers.providers.Provider
		);
		this._contract = this._contract?.connect(this.multicallProvider);
	}
}
