import { PoolCommitter, PoolCommitter__factory } from "@tracer-protocol/perpetual-pools-contracts/types";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { CommitEnum, IContract, PendingAmounts } from "../types";

export interface IPoolCommitter extends IContract {
	quoteTokenDecimals: number;
	minimumCommitSize?: number;
}

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
	} // private constructor

	public static Create: (committerInfo: IPoolCommitter) => Promise<Committer> = async (committerInfo) => {
		const committer = new Committer();
		// initialise the token;
		await committer.init(committerInfo);
		return committer;
	}

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