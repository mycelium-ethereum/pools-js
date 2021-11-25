import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { NETWORKS } from '../utils';

/**
 * Holds burn and mint pending amounts
 * PendingAmounts.mint is the amount of quote token pending in the shadow pools
 * PendingAmounts.burn is the amount of to be burned pool tokens in the shadow pools
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
	provider: ethers.providers.Provider | ethers.Signer;
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

type KnownNetworkKeys = keyof typeof NETWORKS;
export type KnownNetwork = typeof NETWORKS[KnownNetworkKeys];
