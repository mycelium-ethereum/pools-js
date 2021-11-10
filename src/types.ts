import BigNumber from "bignumber.js";
import { ethers } from "ethers";

export type PendingAmounts = {
    mint: BigNumber; // amount of USDC pending in commit
    burn: BigNumber; // amount of tokens burned in commits
};

export interface IContract {
	address: string;
	provider: ethers.providers.JsonRpcProvider;
}