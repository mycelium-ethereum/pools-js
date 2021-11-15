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
	 * Minimum commit size can be passed in as a props otherwise, 
	 * 	it will be instantiated by fetching it from the PoolCommitter contract
	 */
	minimumCommitSize?: number;
}

/**
 * Interface for interacting with the PoolComitter.
 * Can be used standalone, but is always initialised within a
 * 	{@linkcode Pool}
 * Constructor is private so must be instantiated with {@linkcode Committer.Create}
 */
export default class Committer {
	address: string;
	provider: ethers.providers.JsonRpcProvider;
    pendingLong: PendingAmounts;
    pendingShort: PendingAmounts;
    minimumCommitSize: BigNumber;

	private constructor () {
		// these all need to be ovverridden in the init function
		this.address = '';
		this.provider = new ethers.providers.JsonRpcProvider('');
		this.pendingLong = {
			mint: new BigNumber(0),
			burn: new BigNumber(0),
		}
		this.pendingShort = {
			mint: new BigNumber(0),
			burn: new BigNumber(0),
		}
		this.minimumCommitSize = new BigNumber(0);
	}

	/**
	 * Replacement constructor patern to support async initialisations
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

		const contract = new ethers.Contract(
			commitInfo.address,
			PoolCommitter__factory.abi,
			commitInfo.provider,
		) as PoolCommitter;

		const providedMinCommitSize = !!commitInfo?.minimumCommitSize;

		const [
			minimumCommitSize,
			longMints,
			longBurns,
			shortMints,
			shortBurns
		] = await Promise.all([
			providedMinCommitSize ? ethers.BigNumber.from(commitInfo.minimumCommitSize) : contract.minimumCommitSize(),
			contract.shadowPools(CommitEnum.long_mint),
			contract.shadowPools(CommitEnum.long_burn),
			contract.shadowPools(CommitEnum.short_mint),
			contract.shadowPools(CommitEnum.short_burn),
		])
		this.minimumCommitSize = new BigNumber(minimumCommitSize.toString()),
		this.pendingLong = {
			mint: new BigNumber(ethers.utils.formatUnits(longMints, commitInfo.quoteTokenDecimals)),
			burn: new BigNumber(ethers.utils.formatUnits(longBurns, commitInfo.quoteTokenDecimals)),
		}
		this.pendingShort = {
			mint: new BigNumber(ethers.utils.formatUnits(shortMints, commitInfo.quoteTokenDecimals)),
			burn: new BigNumber(ethers.utils.formatUnits(shortBurns, commitInfo.quoteTokenDecimals)),
		}
	}
}