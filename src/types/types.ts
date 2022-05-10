import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { NETWORKS } from '../utils';
import { PoolCommitter } from "@tracer-protocol/perpetual-pools-contracts/types";

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

export type TotalPoolCommitments = Awaited<ReturnType<PoolCommitter['totalPoolCommitments']>>

export type TotalPoolCommitmentsBN = {
  longMintSettlement: BigNumber;
  longBurnPoolTokens: BigNumber;
  shortMintSettlement: BigNumber;
  shortBurnPoolTokens: BigNumber;
  shortBurnLongMintPoolTokens: BigNumber;
  longBurnShortMintPoolTokens: BigNumber;
}

export type OraclePriceTransformer = (lastPrice: BigNumber, currentPrice: BigNumber) => BigNumber

export type PoolStatePreviewInputs = {
  leverage: BigNumber,
  fee: BigNumber,
  longBalance: BigNumber,
  shortBalance: BigNumber,
  longTokenSupply: BigNumber,
  shortTokenSupply: BigNumber,
  pendingLongTokenBurn: BigNumber,
  pendingShortTokenBurn: BigNumber,
  lastOraclePrice: BigNumber,
  currentOraclePrice: BigNumber,
  pendingCommits: TotalPoolCommitmentsBN[],
	oraclePriceTransformer: OraclePriceTransformer
}

export type PoolStatePreview = {
  timestamp: number,
  currentSkew: BigNumber,
  currentLongBalance: BigNumber,
  currentLongSupply: BigNumber,
  currentShortBalance: BigNumber,
  currentShortSupply: BigNumber,
  lastOraclePrice: BigNumber,
  pendingCommits: TotalPoolCommitmentsBN[]
} & ExpectedStateAfterCommitments;

export type ExpectedStateAfterCommitments = {
  expectedLongBalance: BigNumber,
  expectedShortBalance: BigNumber,
  expectedLongSupply: BigNumber,
  expectedShortSupply: BigNumber,
  expectedLongTokenPrice: BigNumber,
  expectedShortTokenPrice: BigNumber,
  expectedOraclePrice: BigNumber,
  expectedSkew: BigNumber,
  totalNetPendingLong: BigNumber,
  totalNetPendingShort: BigNumber,
}


