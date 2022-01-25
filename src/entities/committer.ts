import { PoolCommitter, PoolCommitter__factory } from "@tracer-protocol/perpetual-pools-contracts/types";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { CommitEnum, IContract, PendingAmounts } from "../types";

/**
 * PoolCommitter class constructor inputs
 */
export interface IPoolCommitter extends IContract {
	quoteTokenDecimals: number;
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
	quoteTokenDecimals: 18,
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
	provider: ethers.providers.Provider | ethers.Signer;
	quoteTokenDecimals: number;
    pendingLong: PendingAmounts;
    pendingShort: PendingAmounts;

	private constructor () {
		// these all need to be ovverridden in the init function
		this.address = '';
		this.provider = new ethers.providers.JsonRpcProvider('');
		this.pendingLong = {
			...defaultCommitter.pendingLong
		} 
		this.pendingShort= {
			...defaultCommitter.pendingShort
		}
		this.quoteTokenDecimals = defaultCommitter.quoteTokenDecimals;
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
		this.address = commitInfo.address;
		this.quoteTokenDecimals = commitInfo.quoteTokenDecimals;

		const contract = PoolCommitter__factory.connect(
			commitInfo.address,
			commitInfo.provider,
		)
		this._contract = contract;

		try {
			await this.fetchAllShadowPools()
		} catch(error) {
			throw Error(
				"Failed to initialise committer: " + error
			)
		}
	}

	/**
	 * Submits a commit
	 * @param type 1 of 4 commit types. These values are (0, 1, 2, 3) => (shortMint, shortBurn, longMint, longBurn)
	 * @param amount either a number or BigNumber representing the amount of tokens
	 * 	to be committed if burning, or the amount of quote token to use to mint new tokens
	 */
	public commit: (type: CommitEnum, amount: number | BigNumber) => Promise<ethers.ContractTransaction> = (type, amount) => {
		if (!this._contract) throw Error("Failed to commit: this._contract undefined")
		// TODO allow from aggregate balance and auto claim
		return this._contract.commit(type, ethers.utils.parseUnits(amount.toString(), this.quoteTokenDecimals), false, false)
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

		const [
			// [
				// longBurnsFrontRunning,
				// longMintsFrontRunning,
				// shortBurnsFrontRunning,
				// shortMintsFrontRunning,
				// shortBurnLongMintsFrontRunning,
				// longBurnShortMintsFrontRunning,
				// updateIntervalIdFrontRunning,
			// ], 
			// TODO temp
			_frontRunning,
			[
				longBurns,
				longMints,
				shortBurns,
				shortMints,
				_shortBurnLongMints,
				_longBurnShortMints,
				_updateIntervalId,
			], 
		] = await this._contract.getPendingCommits().catch((error) => {
			throw Error("Failed to update pending amounts: " + error?.message)
		})

		const decimals = this.quoteTokenDecimals;
		return ({
			pendingLong: {
				mint: new BigNumber(ethers.utils.formatUnits(longMints, decimals)),
				burn: new BigNumber(ethers.utils.formatUnits(longBurns, decimals))
			},
			pendingShort: {
				mint: new BigNumber(ethers.utils.formatUnits(shortMints, decimals)),
				burn: new BigNumber(ethers.utils.formatUnits(shortBurns, decimals))
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
		this._contract = this._contract?.connect(provider);
	}
}
