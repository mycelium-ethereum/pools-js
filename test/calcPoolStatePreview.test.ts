import {
  describe,
  test,
  expect,
  jest,
  beforeEach
} from '@jest/globals';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import type { OraclePriceTransformer } from '../src';

import {
  calcNextValueTransfer,
  calcPoolStatePreview,
  movingAveragePriceTransformer
} from '../src/utils';

import {
  getMockPendingCommits,
  poolStatePreviewInputDefaults,
} from './_mockData';


const spotOracleTransformer: OraclePriceTransformer = (lastPrice, newPrice) => newPrice;

describe('calcPoolStatePreview', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('[1 interval - spot oracle] calculates state with no pending commits', async () => {

    const {
      currentLongBalance,
      currentShortBalance,
      currentLongSupply,
      currentShortSupply,
      currentSkew,
      totalNetPendingLong,
      totalNetPendingShort,
      lastOraclePrice,
      expectedOraclePrice,
      expectedLongBalance,
      expectedShortBalance,
      expectedShortSupply,
      expectedLongSupply,
      expectedLongTokenPrice,
      expectedShortTokenPrice,
      pendingCommits
    } = calcPoolStatePreview({
      ...poolStatePreviewInputDefaults,
      oraclePriceTransformer: spotOracleTransformer
    });

    expect(currentLongBalance).toEqual(poolStatePreviewInputDefaults.longBalance);
    expect(currentLongSupply).toEqual(
      poolStatePreviewInputDefaults.longTokenSupply.plus(poolStatePreviewInputDefaults.pendingLongTokenBurn)
    );
    expect(currentShortBalance).toEqual(poolStatePreviewInputDefaults.shortBalance);
    expect(currentShortSupply).toEqual(
      poolStatePreviewInputDefaults.shortTokenSupply.plus(poolStatePreviewInputDefaults.pendingShortTokenBurn)
    );
    expect(currentSkew).toEqual(currentLongBalance.div(currentShortBalance));
    expect(totalNetPendingLong).toEqual(new BigNumber(0));
    expect(totalNetPendingShort).toEqual(new BigNumber(0));

    const {
      shortValueTransfer,
      longValueTransfer
    } = calcNextValueTransfer(
      lastOraclePrice,
      expectedOraclePrice,
      new BigNumber(poolStatePreviewInputDefaults.leverage),
      currentLongBalance,
      currentShortBalance
    );

    expect(expectedShortBalance).toEqual(currentShortBalance.plus(shortValueTransfer));
    expect(expectedLongBalance).toEqual(currentLongBalance.plus(longValueTransfer));
    expect(expectedShortSupply).toEqual(currentShortSupply);
    expect(expectedLongSupply).toEqual(currentLongSupply);

    expect(expectedLongTokenPrice).toEqual(expectedLongBalance.div(expectedLongSupply));
    expect(expectedShortTokenPrice).toEqual(expectedShortBalance.div(expectedShortSupply));

    expect(pendingCommits).toEqual(poolStatePreviewInputDefaults.pendingCommits);
  });

  test('[3 intervals - spot oracle] calculates state with pending commits', async () => {

    const mockPendingCommits = [{
      longMintSettlement: new BigNumber(ethers.utils.parseUnits('1000', 18).toString()),
      longBurnPoolTokens: new BigNumber(ethers.utils.parseUnits('500', 18).toString()),
      shortMintSettlement: new BigNumber(ethers.utils.parseUnits('1000', 18).toString()),
      shortBurnPoolTokens: new BigNumber(0),
      shortBurnLongMintPoolTokens: new BigNumber(0),
      longBurnShortMintPoolTokens: new BigNumber(0),
      updateIntervalId: new BigNumber(1)
    }, {
      longMintSettlement: new BigNumber(ethers.utils.parseUnits('1500', 18).toString()),
      longBurnPoolTokens: new BigNumber(ethers.utils.parseUnits('1000', 18).toString()),
      shortMintSettlement: new BigNumber(0),
      shortBurnPoolTokens: new BigNumber(ethers.utils.parseUnits('1000', 18).toString()),
      shortBurnLongMintPoolTokens: new BigNumber(0),
      longBurnShortMintPoolTokens: new BigNumber(0),
      updateIntervalId: new BigNumber(1)
    }, {
      longMintSettlement: new BigNumber(ethers.utils.parseUnits('500', 18).toString()),
      longBurnPoolTokens: new BigNumber(0),
      shortMintSettlement: new BigNumber(0),
      shortBurnPoolTokens: new BigNumber(ethers.utils.parseUnits('500', 18).toString()),
      shortBurnLongMintPoolTokens: new BigNumber(ethers.utils.parseUnits('1000', 18).toString()),
      longBurnShortMintPoolTokens: new BigNumber(ethers.utils.parseUnits('1000', 18).toString()),
      updateIntervalId: new BigNumber(1)
    }];

    const poolStatePreviewInputs = {
      ...poolStatePreviewInputDefaults,
      pendingCommits: mockPendingCommits,
      oraclePriceTransformer: spotOracleTransformer
    };

    const {
      currentLongBalance,
      currentShortBalance,
      currentLongSupply,
      currentShortSupply,
      currentSkew,
      expectedLongBalance,
      expectedShortBalance,
      expectedShortSupply,
      expectedLongSupply,
      expectedLongTokenPrice,
      expectedShortTokenPrice,
      pendingCommits
    } = calcPoolStatePreview(poolStatePreviewInputs);

    let _lastOraclePrice = poolStatePreviewInputs.lastOraclePrice;
    let _expectedOraclePrice = spotOracleTransformer(
      poolStatePreviewInputs.lastOraclePrice,
      poolStatePreviewInputs.currentOraclePrice
    );

    // interval 1 expected results (no XBurnYMint commits)

    const {
      shortValueTransfer: interval1ShortValueTransfer,
      longValueTransfer: interval1LongValueTransfer
    } = calcNextValueTransfer(
      _lastOraclePrice,
      _expectedOraclePrice,
      new BigNumber(poolStatePreviewInputDefaults.leverage),
      currentLongBalance,
      currentShortBalance
    );

    const interval1ShortBalance = currentShortBalance.plus(interval1ShortValueTransfer);
    const interval1LongBalance = currentLongBalance.plus(interval1LongValueTransfer);

    const interval1ShortPrice = interval1ShortBalance.div(currentShortSupply.plus(pendingCommits[0].shortBurnPoolTokens));
    const interval1LongPrice = interval1LongBalance.div(currentLongSupply.plus(pendingCommits[0].longBurnPoolTokens));

    const interval1ShortBalanceChange = pendingCommits[0].shortMintSettlement
      .minus(pendingCommits[0].shortBurnPoolTokens.times(interval1ShortPrice));
    const interval1LongBalanceChange = pendingCommits[0].longMintSettlement
      .minus(pendingCommits[0].longBurnPoolTokens.times(interval1LongPrice));

    const interval1ShortSupplyChange = pendingCommits[0].shortMintSettlement.div(interval1ShortPrice)
      .minus(pendingCommits[0].shortBurnPoolTokens);
    const interval1LongSupplyChange = pendingCommits[0].longMintSettlement.div(interval1LongPrice)
      .minus(pendingCommits[0].longBurnPoolTokens);

    _lastOraclePrice = _expectedOraclePrice;
    _expectedOraclePrice = spotOracleTransformer(_lastOraclePrice, _expectedOraclePrice);

    const interval1FinalShortBalance = interval1ShortBalance.plus(interval1ShortBalanceChange);
    const interval1FinalLongBalance = interval1LongBalance.plus(interval1LongBalanceChange);

    const interval1FinalShortSupply = currentShortSupply.plus(interval1ShortSupplyChange);
    const interval1FinalLongSupply = currentLongSupply.plus(interval1LongSupplyChange);

    // interval 2 expected results (no XBurnYMint commits)

    const {
      shortValueTransfer: interval2ShortValueTransfer,
      longValueTransfer: interval2LongValueTransfer
    } = calcNextValueTransfer(
      _lastOraclePrice,
      _expectedOraclePrice,
      new BigNumber(poolStatePreviewInputDefaults.leverage),
      interval1FinalLongBalance,
      interval1FinalShortBalance
    );

    const interval2ShortBalance = interval1FinalShortBalance.plus(interval2ShortValueTransfer);
    const interval2LongBalance = interval1FinalLongBalance.plus(interval2LongValueTransfer);

    const interval2ShortPrice = interval2ShortBalance.div(interval1FinalShortSupply.plus(pendingCommits[1].shortBurnPoolTokens));
    const interval2LongPrice = interval2LongBalance.div(interval1FinalLongSupply.plus(pendingCommits[1].longBurnPoolTokens));

    const interval2ShortBalanceChange = pendingCommits[1].shortMintSettlement
      .minus(pendingCommits[1].shortBurnPoolTokens.times(interval2ShortPrice));
    const interval2LongBalanceChange = pendingCommits[1].longMintSettlement
      .minus(pendingCommits[1].longBurnPoolTokens.times(interval2LongPrice));

    const interval2ShortSupplyChange = pendingCommits[1].shortMintSettlement.div(interval2ShortPrice)
      .minus(pendingCommits[1].shortBurnPoolTokens);

    const interval2LongSupplyChange = pendingCommits[1].longMintSettlement.div(interval2LongPrice)
      .minus(pendingCommits[1].longBurnPoolTokens);

    _lastOraclePrice = _expectedOraclePrice;
    _expectedOraclePrice = spotOracleTransformer(_lastOraclePrice, _expectedOraclePrice);

    const interval2FinalShortBalance = interval2ShortBalance.plus(interval2ShortBalanceChange);
    const interval2FinalLongBalance = interval2LongBalance.plus(interval2LongBalanceChange);

    const interval2FinalShortSupply = interval1FinalShortSupply.plus(interval2ShortSupplyChange);
    const interval2FinalLongSupply = interval1FinalLongSupply.plus(interval2LongSupplyChange);

    // interval 3 expected results

    const {
      shortValueTransfer: interval3ShortValueTransfer,
      longValueTransfer: interval3LongValueTransfer
    } = calcNextValueTransfer(
      _lastOraclePrice,
      _expectedOraclePrice,
      new BigNumber(poolStatePreviewInputDefaults.leverage),
      interval2FinalLongBalance,
      interval2FinalShortBalance
    );

    const interval3ShortBalance = interval2FinalShortBalance.plus(interval3ShortValueTransfer);
    const interval3LongBalance = interval2FinalLongBalance.plus(interval3LongValueTransfer);

    const interval3ShortPrice = interval3ShortBalance.div(
      interval2FinalShortSupply.plus(pendingCommits[2].shortBurnPoolTokens).plus(pendingCommits[2].shortBurnLongMintPoolTokens)
    );
    const interval3LongPrice = interval3LongBalance.div(
      interval2FinalLongSupply.plus(pendingCommits[2].longBurnPoolTokens).plus(pendingCommits[2].longBurnShortMintPoolTokens)
    );

    // balance change = mint amount + mint amount from flips - burn result - burn result from flips
    const interval3ShortBalanceChange = pendingCommits[2].shortMintSettlement
      .plus(pendingCommits[2].longBurnShortMintPoolTokens.times(interval3LongPrice))
      .minus(pendingCommits[2].shortBurnPoolTokens.times(interval3ShortPrice))
      .minus(pendingCommits[2].shortBurnLongMintPoolTokens.times(interval3ShortPrice));

    const interval3LongBalanceChange = pendingCommits[2].longMintSettlement
      .plus(pendingCommits[2].shortBurnLongMintPoolTokens.times(interval3ShortPrice))
      .minus(pendingCommits[2].longBurnPoolTokens.times(interval3LongPrice))
      .minus(pendingCommits[2].longBurnShortMintPoolTokens.times(interval3LongPrice));

    // supply change = mint result + mint result from flip - burn amount - burn result from flips
    const interval3ShortSupplyChange = pendingCommits[2].shortMintSettlement.plus(
      pendingCommits[2].longBurnShortMintPoolTokens.times(interval3LongPrice)
    )
      .div(interval3ShortPrice)
      .minus(pendingCommits[2].shortBurnPoolTokens)
      .minus(pendingCommits[2].shortBurnLongMintPoolTokens);

    const interval3LongSupplyChange = pendingCommits[2].longMintSettlement.plus(
      pendingCommits[2].shortBurnLongMintPoolTokens.times(interval3ShortPrice)
    )
      .div(interval3LongPrice)
      .minus(pendingCommits[2].longBurnPoolTokens)
      .minus(pendingCommits[2].longBurnShortMintPoolTokens);

    _lastOraclePrice = _expectedOraclePrice;
    _expectedOraclePrice = spotOracleTransformer(_lastOraclePrice, _expectedOraclePrice);

    const interval3FinalShortBalance = interval3ShortBalance.plus(interval3ShortBalanceChange);
    const interval3FinalLongBalance = interval3LongBalance.plus(interval3LongBalanceChange);

    const interval3FinalShortSupply = interval2FinalShortSupply.plus(interval3ShortSupplyChange);
    const interval3FinalLongSupply = interval2FinalLongSupply.plus(interval3LongSupplyChange);

    expect(currentLongBalance).toEqual(poolStatePreviewInputs.longBalance);
    expect(currentLongSupply).toEqual(
      poolStatePreviewInputs.longTokenSupply.plus(poolStatePreviewInputs.pendingLongTokenBurn)
    );
    expect(currentShortBalance).toEqual(poolStatePreviewInputs.shortBalance);
    expect(currentShortSupply).toEqual(
      poolStatePreviewInputs.shortTokenSupply.plus(poolStatePreviewInputs.pendingShortTokenBurn)
    );
    expect(currentSkew).toEqual(currentLongBalance.div(currentShortBalance));

    expect(expectedShortBalance).toEqual(interval3FinalShortBalance);
    expect(expectedLongBalance).toEqual(interval3FinalLongBalance);
    expect(expectedShortSupply).toEqual(interval3FinalShortSupply);
    expect(expectedLongSupply).toEqual(interval3FinalLongSupply);

    expect(expectedLongTokenPrice).toEqual(interval3LongPrice);
    expect(expectedShortTokenPrice).toEqual(interval3ShortPrice);

    expect(pendingCommits).toEqual(poolStatePreviewInputs.pendingCommits);
  });

  test('[3 intervals vs 1 interval x 3] - should be the same end result', async () => {
    const mockPendingCommits = [{
      longMintSettlement: new BigNumber(ethers.utils.parseUnits('1000', 18).toString()),
      longBurnPoolTokens: new BigNumber(ethers.utils.parseUnits('500', 18).toString()),
      shortMintSettlement: new BigNumber(ethers.utils.parseUnits('1000', 18).toString()),
      shortBurnPoolTokens: new BigNumber(0),
      shortBurnLongMintPoolTokens: new BigNumber(0),
      longBurnShortMintPoolTokens: new BigNumber(0),
      updateIntervalId: new BigNumber(1)
    }, {
      longMintSettlement: new BigNumber(ethers.utils.parseUnits('1500', 18).toString()),
      longBurnPoolTokens: new BigNumber(ethers.utils.parseUnits('1000', 18).toString()),
      shortMintSettlement: new BigNumber(0),
      shortBurnPoolTokens: new BigNumber(ethers.utils.parseUnits('1000', 18).toString()),
      shortBurnLongMintPoolTokens: new BigNumber(0),
      longBurnShortMintPoolTokens: new BigNumber(0),
      updateIntervalId: new BigNumber(1)
    }, {
      longMintSettlement: new BigNumber(ethers.utils.parseUnits('500', 18).toString()),
      longBurnPoolTokens: new BigNumber(0),
      shortMintSettlement: new BigNumber(0),
      shortBurnPoolTokens: new BigNumber(ethers.utils.parseUnits('500', 18).toString()),
      shortBurnLongMintPoolTokens: new BigNumber(ethers.utils.parseUnits('1000', 18).toString()),
      longBurnShortMintPoolTokens: new BigNumber(ethers.utils.parseUnits('1000', 18).toString()),
      updateIntervalId: new BigNumber(1)
    }];

    const sharedPoolStatePreviewInputs = {
      ...poolStatePreviewInputDefaults,
      oraclePriceTransformer: spotOracleTransformer
    }

    const allInOneResult = calcPoolStatePreview({
      ...sharedPoolStatePreviewInputs,
      pendingCommits: mockPendingCommits,
    });

    const interval1Result = calcPoolStatePreview({
      ...sharedPoolStatePreviewInputs,
      pendingCommits: [mockPendingCommits[0]],
    });

    const interval2Result = calcPoolStatePreview({
      ...sharedPoolStatePreviewInputs,
      longBalance: interval1Result.expectedLongBalance,
      shortBalance: interval1Result.expectedShortBalance,
      longTokenSupply: interval1Result.expectedLongSupply,
      shortTokenSupply: interval1Result.expectedShortSupply,
      // these get added to starting balance so are already accounted for in interval 1
      pendingLongTokenBurn: new BigNumber(0),
      pendingShortTokenBurn: new BigNumber(0),
      lastOraclePrice: interval1Result.expectedOraclePrice,
      pendingCommits: [mockPendingCommits[1]]
    });

    const interval3Result = calcPoolStatePreview({
      ...sharedPoolStatePreviewInputs,
      longBalance: interval2Result.expectedLongBalance,
      shortBalance: interval2Result.expectedShortBalance,
      longTokenSupply: interval2Result.expectedLongSupply,
      shortTokenSupply: interval2Result.expectedShortSupply,
      // these get added to starting balance so are already accounted for in interval 1
      pendingLongTokenBurn: new BigNumber(0),
      pendingShortTokenBurn: new BigNumber(0),
      lastOraclePrice: interval2Result.expectedOraclePrice,
      pendingCommits: [mockPendingCommits[2]]
    });

    expect(allInOneResult.expectedLongBalance).toEqual(interval3Result.expectedLongBalance);
    expect(allInOneResult.expectedShortBalance).toEqual(interval3Result.expectedShortBalance);
    expect(allInOneResult.expectedLongSupply).toEqual(interval3Result.expectedLongSupply);
    expect(allInOneResult.expectedShortSupply).toEqual(interval3Result.expectedShortSupply);
    expect(allInOneResult.expectedLongTokenPrice).toEqual(interval3Result.expectedLongTokenPrice);
    expect(allInOneResult.expectedShortTokenPrice).toEqual(interval3Result.expectedShortTokenPrice);
  });

  test('[3 intervals - sma oracle] calculates state with no pending commits', async () => {
    const poolStatePreviewInputs = {
      ...poolStatePreviewInputDefaults,
      pendingCommits: [
        getMockPendingCommits({ updateIntervalId: new BigNumber(1) }),
        getMockPendingCommits({ updateIntervalId: new BigNumber(2) }),
        getMockPendingCommits({ updateIntervalId: new BigNumber(3) })
      ],
      oraclePriceTransformer: movingAveragePriceTransformer
    };

    const {
      currentLongBalance,
      currentShortBalance,
      currentLongSupply,
      currentShortSupply,
      currentSkew,
      totalNetPendingLong,
      totalNetPendingShort,
      expectedLongBalance,
      expectedShortBalance,
      expectedShortSupply,
      expectedLongSupply,
      expectedLongTokenPrice,
      expectedShortTokenPrice,
      pendingCommits
    } = calcPoolStatePreview(poolStatePreviewInputs);

    expect(currentLongBalance).toEqual(poolStatePreviewInputDefaults.longBalance);
    expect(currentLongSupply).toEqual(
      poolStatePreviewInputDefaults.longTokenSupply.plus(poolStatePreviewInputDefaults.pendingLongTokenBurn)
    );
    expect(currentShortBalance).toEqual(poolStatePreviewInputDefaults.shortBalance);
    expect(currentShortSupply).toEqual(
      poolStatePreviewInputDefaults.shortTokenSupply.plus(poolStatePreviewInputDefaults.pendingShortTokenBurn)
    );
    expect(currentSkew).toEqual(currentLongBalance.div(currentShortBalance));
    expect(totalNetPendingLong).toEqual(new BigNumber(0));
    expect(totalNetPendingShort).toEqual(new BigNumber(0));

    let _netShortValueTransfer = new BigNumber(0);
    let _netLongValueTransfer = new BigNumber(0);

    let _lastOraclePrice = poolStatePreviewInputDefaults.lastOraclePrice;
    let _expectedOraclePrice = poolStatePreviewInputs.oraclePriceTransformer(
      poolStatePreviewInputDefaults.lastOraclePrice,
      poolStatePreviewInputDefaults.currentOraclePrice
    );

    // calculate expected value transfers
    for (let i = 0; i < poolStatePreviewInputs.pendingCommits.length; i++) {
      const {
        shortValueTransfer,
        longValueTransfer
      } = calcNextValueTransfer(
        _lastOraclePrice,
        _expectedOraclePrice,
        new BigNumber(poolStatePreviewInputs.leverage),
        currentLongBalance.plus(_netLongValueTransfer),
        currentShortBalance.plus(_netShortValueTransfer)
      );

      _lastOraclePrice = _expectedOraclePrice;
      _expectedOraclePrice = poolStatePreviewInputs.oraclePriceTransformer(
        _lastOraclePrice,
        poolStatePreviewInputDefaults.currentOraclePrice
      );

      _netLongValueTransfer = _netLongValueTransfer.plus(longValueTransfer);
      _netShortValueTransfer = _netShortValueTransfer.plus(shortValueTransfer);
    }

    expect(expectedShortBalance).toEqual(currentShortBalance.plus(_netShortValueTransfer));
    expect(expectedLongBalance).toEqual(currentLongBalance.plus(_netLongValueTransfer));
    expect(expectedShortSupply).toEqual(currentShortSupply);
    expect(expectedLongSupply).toEqual(currentLongSupply);

    expect(expectedLongTokenPrice).toEqual(expectedLongBalance.div(expectedLongSupply));
    expect(expectedShortTokenPrice).toEqual(expectedShortBalance.div(expectedShortSupply));

    expect(pendingCommits).toEqual(poolStatePreviewInputs.pendingCommits);
  });
});
