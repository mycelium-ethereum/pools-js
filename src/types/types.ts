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
  leverage: BigNumber, // pool leverage
  fee: BigNumber, // pool fee represented as a decimal 0.05 == 5%
  longBalance: BigNumber,
  shortBalance: BigNumber,
  longTokenSupply: BigNumber,
  shortTokenSupply: BigNumber,
  pendingLongTokenBurn: BigNumber, // amount of longTokens being burnt
  pendingShortTokenBurn: BigNumber, // amount of shortTokens being burnt
  lastOraclePrice: BigNumber, // last recored oracle price == last upkeep price
  currentOraclePrice: BigNumber,

  // TotalCommits for each upkeep.
  // One entry in this array is the summation of commits for its respective upkeep
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
  currentLongTokenPrice: BigNumber,
  currentShortTokenPrice: BigNumber,
  currentPendingLongTokenBurn: BigNumber,
  currentPendingShortTokenBurn: BigNumber,
  expectedSkew: BigNumber,
  expectedLongBalance: BigNumber,
  expectedLongSupply: BigNumber,
  expectedShortBalance: BigNumber,
  expectedShortSupply: BigNumber,
  totalNetPendingLong: BigNumber,
  totalNetPendingShort: BigNumber,
  expectedLongTokenPrice: BigNumber,
  expectedShortTokenPrice: BigNumber,
  expectedPendingLongTokenBurn: BigNumber,
  expectedPendingShortTokenBurn: BigNumber,
  lastOraclePrice: BigNumber,
  expectedOraclePrice: BigNumber,
  pendingCommits: TotalPoolCommitmentsBN[]
}


export interface OracleClass<C> {
	_contract?: C; // they must be ChainlinkOracleWrapper
	address: string;
	provider: ethers.providers.Provider | ethers.Signer | undefined;

    getPrice: () => Promise<BigNumber>;
}
