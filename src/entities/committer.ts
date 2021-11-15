import { PoolCommitter, PoolCommitter__factory } from "@tracer-protocol/perpetual-pools-contracts/types";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { CommitEnum, IContract, PendingAmounts } from "../types";

/**
 * PoolCommitter class constructor inputs
 */
export interface IPoolCommitter extends IContract {
	quoteTokenDecimals: number;
	/**
	 * Minimum commit size can be passed in as a props, otherwise, it is instantiated by fetching it from the PoolCommitter contract
	 */
	minimumCommitSize?: number;
}

const defaults = {
	pendingLong: {
		mint: new BigNumber(0),
		burn: new BigNumber(0),
	},
	pendingShort: {
		mint: new BigNumber(0),
		burn: new BigNumber(0),
	},
	quoteTokenDecimals: 18,
	minimumCommitSize: new BigNumber(0)
}

/**
 * Interface for interacting with the PoolComitter.
 * Can be used standalone, but is always initialised within a
 * 	{@linkcode Pool}
 * The constructor is private so must be instantiated with {@linkcode Committer.Create}
 */
export default class Committer {
	_contract?: PoolCommitter;
	address: string;
	provider: ethers.providers.JsonRpcProvider;
	quoteTokenDecimals: number;
    pendingLong: PendingAmounts;
    pendingShort: PendingAmounts;
    minimumCommitSize: BigNumber;

	private constructor () {
		// these all need to be ovverridden in the init function
		this.address = '';
		this.provider = new ethers.providers.JsonRpcProvider('');
		this.pendingLong = defaults.pendingLong
		this.pendingShort= defaults.pendingShort;
		this.quoteTokenDecimals = defaults.quoteTokenDecimals;
		this.minimumCommitSize = defaults.minimumCommitSize
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
	 * Private initialisation function called in {@link Committer.Create}
	 * @param committerInfo {@link IPoolCommitter | IPoolCommitter interface props}
	 */
	private init: (commitInfo: IPoolCommitter) => void = async (commitInfo) => {
		this.provider = commitInfo.provider;
		this.address = commitInfo.address;
		this.quoteTokenDecimals = commitInfo.quoteTokenDecimals;

		const contract = new ethers.Contract(
			commitInfo.address,
			PoolCommitter__factory.abi,
			commitInfo.provider,
		) as PoolCommitter;
		this._contract = contract;

		const providedMinCommitSize = !!commitInfo?.minimumCommitSize;

		const [
			minimumCommitSize,
		] = await Promise.all([
			providedMinCommitSize ? ethers.BigNumber.from(commitInfo.minimumCommitSize) : contract.minimumCommitSize(),
			this.fetchAllShadowPools()
		]).catch((error) => {
				throw Error(
					"Failed to initialise committer: " + error?.message
				)
			})
		// its unlikely that this will need to be refetched from the contracts
		this.minimumCommitSize = new BigNumber(minimumCommitSize.toString());
	}

	/**
	 * Submits a commit
	 * @param type 1 of 4 commit types. These values are (0, 1, 2, 3) => (shortMint, shortBurn, longMint, longBurn)
	 * @param amount either a number or BigNumber representing the amount of tokens
	 * 	to be committed if burning, or the amount of quote token to use to mint new tokens
	 */
	public commit: (type: CommitEnum, amount: number | BigNumber) => Promise<ethers.ContractTransaction> = (type, amount) => {
		if (!this._contract) throw Error("Failed to commit: this._contract undefined")
		const signer = this.provider.getSigner();
		if (!signer) throw Error("Failed to commit: provider.getSigner is undefined")
		return this._contract.connect(signer).commit(type, ethers.utils.parseUnits(amount.toString(), this.quoteTokenDecimals))
	}


	/**
	 * Updates a specific shadow pools balance.
	 * This functions returns the amount as well as setting its internal
	 * 	store.
	 * @param shadowPool id identifier of the shadow pool. 1 of 4
	 * 	values being (0, 1, 2, 3) => (shortMint, shortBurn, longMint, longBurn)
	 * @returns the refetched amount of the shadow pool
	 */
	public fetchShadowPool: (shadowPool: CommitEnum) => Promise<BigNumber> = async (shadowPool) => {
		if (!this._contract) throw Error("Failed to update pending amount: this._contract undefined")

		const amount_ = await (this._contract.shadowPools(shadowPool).catch((error) => {
			throw Error("Failed to update pending amount: " + error?.message)
		}));
		const amount = new BigNumber(ethers.utils.formatUnits(amount_, this.quoteTokenDecimals));
		switch (shadowPool) {
			case CommitEnum.longBurn:
				this.pendingLong.burn = amount; 
				return amount
			case CommitEnum.longMint:
				this.pendingLong.mint = amount; 
				return amount
			case CommitEnum.shortBurn:
				this.pendingShort.burn = amount; 
				return amount
			case CommitEnum.shortMint:
				this.pendingShort.mint = amount; 
				return amount
			default:
				return new BigNumber(0)
		}

	}
	/**
	 * Updates all shadow pool balances.
	 * Calls {@linkcode Committer.fetchShadowPool} on each of the pools.
	 * As such this will also set the internal state of the Class
	 * @returns all refetched shadow pool balances
	 */
	public fetchAllShadowPools: () => Promise<{
		pendingLong: PendingAmounts,
		pendingShort: PendingAmounts,
	}> = async () => {
		if (!this._contract) throw Error("Failed to update pending amounts: this._contract undefined")

		const [
			longMints,
			longBurns,
			shortMints,
			shortBurns
		] = await Promise.all([
			this.fetchShadowPool(CommitEnum.longBurn),
			this.fetchShadowPool(CommitEnum.longMint),
			this.fetchShadowPool(CommitEnum.shortBurn),
			this.fetchShadowPool(CommitEnum.shortMint)
		]).catch((error) => {
			throw Error("Failed to update pending amounts: " + error?.message)
		})

		return ({
			pendingLong: {
				mint: longMints,
				burn: longBurns
			},
			pendingShort: {
				mint: shortMints,
				burn: shortBurns 
			}
		})
	}
}