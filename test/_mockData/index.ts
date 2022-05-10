
import BigNumber from 'bignumber.js';
import type { TotalPoolCommitmentsBN } from '../../src/types';

export const getMockPendingCommits = (overrides?: Partial<TotalPoolCommitmentsBN>): TotalPoolCommitmentsBN => {
  return {
    longMintSettlement: new BigNumber(0),
    longBurnPoolTokens: new BigNumber(0),
    shortMintSettlement: new BigNumber(0),
    shortBurnPoolTokens: new BigNumber(0),
    shortBurnLongMintPoolTokens: new BigNumber(0),
    longBurnShortMintPoolTokens: new BigNumber(0),
    updateIntervalId: new BigNumber(1),
    ...overrides
  };
};

export const poolStatePreviewInputDefaults = {
  leverage: new BigNumber(3),
  fee: new BigNumber(0),
  longBalance: new BigNumber('120000000000000000000000'),
  shortBalance: new BigNumber('100000000000000000000000'),
  longTokenSupply: new BigNumber('90000000000000000000000'),
  shortTokenSupply: new BigNumber('80000000000000000000000'),
  pendingLongTokenBurn: new BigNumber('1000000000000000000000'),
  pendingShortTokenBurn: new BigNumber('2000000000000000000000'),
  lastOraclePrice: new BigNumber('100000000000000000000000'),
  currentOraclePrice: new BigNumber('110000000000000000000000'),
  pendingCommits: [
    getMockPendingCommits()
  ],
};
