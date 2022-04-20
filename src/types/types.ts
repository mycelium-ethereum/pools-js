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

export type TotalPoolCommitments = [
  ethers.BigNumber,
  ethers.BigNumber,
  ethers.BigNumber,
  ethers.BigNumber,
  ethers.BigNumber,
  ethers.BigNumber,
  ethers.BigNumber
] & {
  longMintSettlement: ethers.BigNumber;
  longBurnPoolTokens: ethers.BigNumber;
  shortMintSettlement: ethers.BigNumber;
  shortBurnPoolTokens: ethers.BigNumber;
  shortBurnLongMintPoolTokens: ethers.BigNumber;
  longBurnShortMintPoolTokens: ethers.BigNumber;
  updateIntervalId: ethers.BigNumber;
}

export type TotalPoolCommitmentsBN = {
  longMintSettlement: BigNumber;
  longBurnPoolTokens: BigNumber;
  shortMintSettlement: BigNumber;
  shortBurnPoolTokens: BigNumber;
  shortBurnLongMintPoolTokens: BigNumber;
  longBurnShortMintPoolTokens: BigNumber;
  updateIntervalId: BigNumber;
}

export type OraclePriceTransformer = (lastPrice: BigNumber, currentPrice: BigNumber) => BigNumber

export type PoolStatePreviewInputs = {
  leverage: number,
  longBalance: BigNumber,
  shortBalance: BigNumber,
  longTokenSupply: BigNumber,
  shortTokenSupply: BigNumber,
  pendingLongTokenBurn: BigNumber,
  pendingShortTokenBurn: BigNumber,
  lastOraclePrice: BigNumber,
  currentOraclePrice: BigNumber,
  pendingCommits: Array<TotalPoolCommitmentsBN>,
	oraclePriceTransformer: OraclePriceTransformer
}

export type PoolStatePreview = {
  timestamp: number,
  currentSkew: BigNumber,
  currentLongBalance: BigNumber,
  currentLongSupply: BigNumber,
  currentShortBalance: BigNumber,
  currentShortSupply: BigNumber,
  expectedSkew: BigNumber,
  expectedLongBalance: BigNumber,
  expectedLongSupply: BigNumber,
  expectedShortBalance: BigNumber,
  expectedShortSupply: BigNumber,
  totalNetPendingLong: BigNumber,
  totalNetPendingShort: BigNumber,
  expectedLongTokenPrice: BigNumber,
  expectedShortTokenPrice: BigNumber,
  lastOraclePrice: BigNumber,
  expectedOraclePrice: BigNumber,
  pendingCommits: TotalPoolCommitmentsBN[]
}
