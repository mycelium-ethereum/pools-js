import BigNumber from "bignumber.js";
import { ethers } from "ethers";

/**
 * Holds burn and mint pending amounts
 * PendingAmounts.mint is the amount of USDC pending in the shadow pools 
 * PendingAmounts.burn is the amount of tokens burned in the shadow pools 
 */
export type PendingAmounts = {
    mint: BigNumber; 
    burn: BigNumber;
};

/**
 * Global contract interface used by each of the {@link entities}
 */
export interface IContract {
	address: string;
	provider: ethers.providers.JsonRpcProvider;
}

/**
 * ERC20 token info which is static and not going to change
 */
export type StaticTokenInfo = {
	address: string;
	name: string;
	symbol: string;
	decimals: number;
}