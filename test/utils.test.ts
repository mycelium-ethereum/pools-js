const chai = require('chai')
const { expect, use } = chai;

//use default BigNumber
use(require('chai-bignumber')());


import { BigNumber } from 'bignumber.js';

import {
  calcPercentageLossTransfer,
  calcNextValueTransfer,
  calcTokenPrice,
  calcEffectiveLongGain,
  calcEffectiveShortGain,
  calcRebalanceRate,
  calcNotionalValue,
  calcLossMultiplier,
  calcAPY,
  calcBptTokenPrice,
  calcBptTokenSpotPrice,
  getExpectedExecutionTimestamp 
} from "../src/utils";

import { ONE_HOUR, FIVE_MINUTES } from './constants';

const TOKEN_SUPPLY = new BigNumber(1000000000);

const ZERO = new BigNumber(0);
const ONE_X = new BigNumber(1);
const THREE_X = new BigNumber(3);

const EQUAL_POOLS = {
  longBalance: new BigNumber(10000),
  shortBalance: new BigNumber(10000)
}

const LESS_SHORT = {
  longBalance: new BigNumber(10000),
  shortBalance: new BigNumber(9000)
}
const LESS_LONG = {
  longBalance: new BigNumber(9000),
  shortBalance: new BigNumber(10000)
}

describe('calcTokenPrice', () => {
  it('Happy path', () => {
    let tokenPrice = calcTokenPrice(new BigNumber(1000), new BigNumber(1000))
    expect(tokenPrice).to.be.bignumber.equal(1);
    tokenPrice = calcTokenPrice(new BigNumber(1000), new BigNumber(10000))
    expect(tokenPrice).to.be.bignumber.equal(0.1);
    tokenPrice = calcTokenPrice(new BigNumber(10000), new BigNumber(1000))
    expect(tokenPrice).to.be.bignumber.equal(10);
  });
  it('No deposits', () => {
    // starting token price is 1
    const tokenPrice = calcTokenPrice(new BigNumber(0), TOKEN_SUPPLY)
    expect(tokenPrice).to.be.bignumber.equal(1);
  });
  it('No supply', () => {
    // price ratio 1/1
    const tokenPrice = calcTokenPrice(new BigNumber(1000), new BigNumber(0))
    expect(tokenPrice).to.be.bignumber.equal(1);
  });
});

describe('calcNextValueTransfer', () => {
  it('No price change', () => {
    let transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(1), ONE_X, EQUAL_POOLS.longBalance, EQUAL_POOLS.shortBalance)
    expect(transfers.shortValueTransfer).to.be.bignumber.equal(0);
    expect(transfers.longValueTransfer).to.be.bignumber.equal(0);
    transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(1), ONE_X, LESS_SHORT.longBalance, LESS_SHORT.shortBalance)
    expect(transfers.shortValueTransfer).to.be.bignumber.equal(0);
    expect(transfers.longValueTransfer).to.be.bignumber.equal(0);
    transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(1), ONE_X, LESS_LONG.longBalance, LESS_LONG.shortBalance)
    expect(transfers.shortValueTransfer).to.be.bignumber.equal(0);
    expect(transfers.longValueTransfer).to.be.bignumber.equal(0);
    transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(1), THREE_X, EQUAL_POOLS.longBalance, EQUAL_POOLS.shortBalance)
    expect(transfers.shortValueTransfer).to.be.bignumber.equal(0);
    expect(transfers.longValueTransfer).to.be.bignumber.equal(0);
    transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(1), THREE_X, LESS_SHORT.longBalance, LESS_SHORT.shortBalance)
    expect(transfers.shortValueTransfer).to.be.bignumber.equal(0);
    expect(transfers.longValueTransfer).to.be.bignumber.equal(0);
    transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(1), THREE_X, LESS_LONG.longBalance, LESS_LONG.shortBalance)
    expect(transfers.shortValueTransfer).to.be.bignumber.equal(0);
    expect(transfers.longValueTransfer).to.be.bignumber.equal(0);
  });
  it('Number goes up 1x', () => {
    // number goes up payment comes from shorts
    const percentageTransfer = calcPercentageLossTransfer(new BigNumber(1), new BigNumber(1.1), ONE_X);
    expect(percentageTransfer.toNumber()).to.be.bignumber.approximately(0.09, 0.01)
    // all transfers should be 9.09% of the shortBalance
    // in the first two cases this is 0.09 * 10000 which is approx -818.18
    let approxValueTransfer = new BigNumber(909.09); // this is 9.09% of 10000
    let transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(1.1), ONE_X, EQUAL_POOLS.longBalance, EQUAL_POOLS.shortBalance)
    expect(transfers.shortValueTransfer.toNumber()).to.be.bignumber.approximately(approxValueTransfer.negated().toNumber(), 0.01);
    expect(transfers.longValueTransfer.toNumber()).to.be.bignumber.approximately(approxValueTransfer.toNumber(), 0.01);
    transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(1.1), ONE_X, LESS_LONG.longBalance, LESS_LONG.shortBalance)
    expect(transfers.shortValueTransfer.toNumber()).to.be.bignumber.approximately(approxValueTransfer.negated().toNumber(), 0.01);
    expect(transfers.longValueTransfer.toNumber()).to.be.bignumber.approximately(approxValueTransfer.toNumber(), 0.01);

    transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(1.1), ONE_X, LESS_SHORT.longBalance, LESS_SHORT.shortBalance)
    approxValueTransfer = new BigNumber(818.18);
    expect(transfers.shortValueTransfer.toNumber()).to.be.bignumber.approximately(approxValueTransfer.negated().toNumber(), 0.01);
    expect(transfers.longValueTransfer.toNumber()).to.be.bignumber.approximately(approxValueTransfer.toNumber(), 0.01);
  });
  it('Number goes down 1x', () => {
    // number goes down payment comes from longs
    const percentageTransfer = calcPercentageLossTransfer(new BigNumber(1), new BigNumber(0.9), ONE_X);
    expect(percentageTransfer.toNumber()).to.be.bignumber.equal(0.1);

    // all transfers should be 10% of the longBalance
    let approxValueTransfer = new BigNumber(1000); // this is 10% of 10000
    let transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(0.9), ONE_X, EQUAL_POOLS.longBalance, EQUAL_POOLS.shortBalance)
    expect(transfers.shortValueTransfer.toNumber()).to.be.bignumber.equal(approxValueTransfer);
    expect(transfers.longValueTransfer.toNumber()).to.be.bignumber.equal(approxValueTransfer.negated());
    transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(0.9), ONE_X, LESS_SHORT.longBalance, LESS_SHORT.shortBalance)
    expect(transfers.shortValueTransfer.toNumber()).to.be.bignumber.equal(approxValueTransfer);
    expect(transfers.longValueTransfer.toNumber()).to.be.bignumber.equal(approxValueTransfer.negated());

    transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(0.9), ONE_X, LESS_LONG.longBalance, LESS_LONG.shortBalance)
    approxValueTransfer = new BigNumber(900); // this is 10% of 900 
    expect(transfers.shortValueTransfer.toNumber()).to.be.bignumber.equal(approxValueTransfer);
    expect(transfers.longValueTransfer.toNumber()).to.be.bignumber.equal(approxValueTransfer.negated());
  });
  it('Number goes up 3x', () => {
    const percentageTransfer = calcPercentageLossTransfer(new BigNumber(1), new BigNumber(1.1), THREE_X);
    expect(percentageTransfer.toNumber()).to.be.bignumber.approximately(0.2486, 0.001);

    // all transfers should be approx 24.86% of the shortBalance
    let approxValueTransfer = new BigNumber(2486.85); // this is 24.86% of 10000
    let transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(1.1), THREE_X, EQUAL_POOLS.longBalance, EQUAL_POOLS.shortBalance)
    expect(transfers.shortValueTransfer.toNumber()).to.be.bignumber.approximately(approxValueTransfer.negated().toNumber(), 0.01);
    expect(transfers.longValueTransfer.toNumber()).to.be.bignumber.approximately(approxValueTransfer.toNumber(), 0.01);
    transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(1.1), THREE_X, LESS_LONG.longBalance, LESS_LONG.shortBalance)
    expect(transfers.shortValueTransfer.toNumber()).to.be.bignumber.approximately(approxValueTransfer.negated().toNumber(), 0.01);
    expect(transfers.longValueTransfer.toNumber()).to.be.bignumber.approximately(approxValueTransfer.toNumber(), 0.01);

    transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(1.1), THREE_X, LESS_SHORT.longBalance, LESS_SHORT.shortBalance)
    approxValueTransfer = new BigNumber(2238.17); // this is 24.86% of 9000
    expect(transfers.shortValueTransfer.toNumber()).to.be.bignumber.approximately(-2238.17, 0.01);
    expect(transfers.longValueTransfer.toNumber()).to.be.bignumber.approximately(2238.17, 0.01);
  });
  it('Number goes down 3x', () => {
    const percentageTransfer = calcPercentageLossTransfer(new BigNumber(1), new BigNumber(0.9), THREE_X);
    expect(percentageTransfer.toNumber()).to.be.bignumber.equal(0.271);

    // all transfers should be approx 27.1% of the longBalance
    let approxValueTransfer = new BigNumber(2710); // this is 27.1% of 10000 
    let transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(0.9), THREE_X, EQUAL_POOLS.longBalance, EQUAL_POOLS.shortBalance)
    expect(transfers.shortValueTransfer).to.be.bignumber.equal(approxValueTransfer);
    expect(transfers.longValueTransfer).to.be.bignumber.equal(approxValueTransfer.negated());
    transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(0.9), THREE_X, LESS_SHORT.longBalance, LESS_SHORT.shortBalance)
    expect(transfers.shortValueTransfer).to.be.bignumber.equal(approxValueTransfer);
    expect(transfers.longValueTransfer).to.be.bignumber.equal(approxValueTransfer.negated());

    approxValueTransfer = new BigNumber(2439); // this is 27.1% of 9000 
    transfers = calcNextValueTransfer(new BigNumber(1), new BigNumber(0.9), THREE_X, LESS_LONG.longBalance, LESS_LONG.shortBalance)
    expect(transfers.shortValueTransfer).to.be.bignumber.equal(approxValueTransfer);
    expect(transfers.longValueTransfer).to.be.bignumber.equal(approxValueTransfer.negated());
  });
});

describe('calcEffectiveGain', () => {
  const longBalance = new BigNumber(1000)
  const shortBalance = new BigNumber(1000)
  it('Equal', () => {
    let effectiveGain = calcEffectiveLongGain(shortBalance, longBalance, THREE_X);
    expect(effectiveGain).to.be.bignumber.equal(THREE_X)

    effectiveGain = calcEffectiveLongGain(shortBalance, longBalance, ONE_X);
    expect(effectiveGain).to.be.bignumber.equal(ONE_X)
  })

  it('Higher long gain', () => {
    let effectiveLongGain= calcEffectiveLongGain(shortBalance, longBalance.minus(100), THREE_X);
    let effectiveShortGain = calcEffectiveShortGain(shortBalance, longBalance.minus(100), THREE_X);
    expect(effectiveLongGain.toNumber()).to.be.bignumber.approximately(3.333, 0.001)
    expect(effectiveShortGain).to.be.bignumber.equal(2.7)

    effectiveLongGain = calcEffectiveLongGain(shortBalance, longBalance.minus(100), ONE_X);
    effectiveShortGain = calcEffectiveShortGain(shortBalance, longBalance.minus(100), ONE_X);
    expect(effectiveLongGain.toNumber()).to.be.bignumber.approximately(1.111, 0.001)
    expect(effectiveShortGain).to.be.bignumber.equal(0.9)
  })

  it('Higher short gain', () => {
    let effectiveLongGain = calcEffectiveLongGain(shortBalance.minus(100), longBalance, THREE_X);
    let effectiveShortGain = calcEffectiveShortGain(shortBalance.minus(100), longBalance, THREE_X);
    expect(effectiveShortGain.toNumber()).to.be.bignumber.approximately(3.333, 0.001)
    expect(effectiveLongGain).to.be.bignumber.equal(2.7)

    effectiveLongGain = calcEffectiveLongGain(shortBalance.minus(100), longBalance, ONE_X);
    effectiveShortGain = calcEffectiveShortGain(shortBalance.minus(100), longBalance, ONE_X);
    expect(effectiveShortGain.toNumber()).to.be.bignumber.approximately(1.111, 0.001)
    expect(effectiveLongGain).to.be.bignumber.equal(0.9)
  })

  it('Both balances 0', () => {
    const effectiveLongGain = calcEffectiveLongGain(ZERO, ZERO, THREE_X);
    const effectiveShortGain = calcEffectiveShortGain(ZERO, ZERO, THREE_X);
    expect(effectiveLongGain).to.be.bignumber.equal(THREE_X)
    expect(effectiveShortGain).to.be.bignumber.equal(THREE_X)
  })
  it('Short balance is 0', () => {
    const effectiveLongGain = calcEffectiveLongGain(ZERO, longBalance, THREE_X);
    const effectiveShortGain = calcEffectiveShortGain(ZERO, longBalance, THREE_X);
    expect(effectiveLongGain).to.be.bignumber.equal(THREE_X)
    expect(effectiveShortGain).to.be.bignumber.equal(THREE_X)
  })
  it('Long balance is 0', () => {
    const effectiveLongGain = calcEffectiveLongGain(shortBalance, ZERO, THREE_X);
    const effectiveShortGain = calcEffectiveLongGain(shortBalance, ZERO, THREE_X);
    expect(effectiveLongGain).to.be.bignumber.equal(THREE_X)
    expect(effectiveShortGain).to.be.bignumber.equal(THREE_X)
  })
})

describe('calcRebalanceRate', () => {
  const longBalance = new BigNumber(1000);
  const shortBalance = new BigNumber(1000);

  it('Equal balances', () => {
    const rebalanceRate = calcRebalanceRate(shortBalance, longBalance)
    expect(rebalanceRate).to.be.bignumber.equal(0)
  })

  it('Higher long balance', () => {
    const rebalanceRate = calcRebalanceRate(shortBalance.minus(100), longBalance)
    expect(rebalanceRate.toNumber()).to.be.bignumber.approximately(0.111, 0.001)
  })

  it('Higher short balance', () => {
    const rebalanceRate = calcRebalanceRate(shortBalance, longBalance.minus(100))
    expect(rebalanceRate).to.be.bignumber.equal(-0.1)
  })

  it('Short balance is 0', () => {
    const rebalanceRate = calcRebalanceRate(ZERO, longBalance)
    expect(rebalanceRate).to.be.bignumber.equal(0)
  })
  it('Long balance is 0', () => {
    const rebalanceRate = calcRebalanceRate(ZERO, longBalance)
    expect(rebalanceRate).to.be.bignumber.equal(0)
  })
  it('Both balances 0', () => {
    const rebalanceRate = calcRebalanceRate(ZERO, longBalance)
    expect(rebalanceRate).to.be.bignumber.equal(0)
  })
})

describe('calcNotionalValue', () => {
  const numTokens = new BigNumber(100)
  it('Calcs notional value', () => {
    let notionalValue = calcNotionalValue(new BigNumber(1), numTokens)
    expect(notionalValue).to.be.bignumber.equal(100)
    notionalValue = calcNotionalValue(new BigNumber(0), numTokens)
    expect(notionalValue).to.be.bignumber.equal(0)
    notionalValue = calcNotionalValue(new BigNumber(2), numTokens)
    expect(notionalValue).to.be.bignumber.equal(200)
  })
})

describe('calcLossMultiplier', () => {
  const oldPrice = new BigNumber(2)
  it('No price change', () => {
    const lossMultiplier = calcLossMultiplier(oldPrice, oldPrice)
    expect(lossMultiplier).to.be.bignumber.equal(1)
  })
  it('Price increase', () => {
    const lossMultiplier = calcLossMultiplier(oldPrice, oldPrice.plus(0.1))
    expect(lossMultiplier.toNumber()).to.be.bignumber.approximately(0.952, 0.001)
  })
  it('Price decrease', () => {
    const lossMultiplier = calcLossMultiplier(oldPrice, oldPrice.minus(0.1))
    expect(lossMultiplier).to.be.bignumber.equal(0.95)
  })
  it('Zeroed balances', () => {
    let lossMultiplier = calcLossMultiplier(ZERO, oldPrice.minus(0.1))
    expect(lossMultiplier).to.be.bignumber.equal(0)
    lossMultiplier = calcLossMultiplier(oldPrice, ZERO)
    expect(lossMultiplier).to.be.bignumber.equal(0)
    lossMultiplier = calcLossMultiplier(ZERO, ZERO)
    expect(lossMultiplier).to.be.bignumber.equal(0)
  })
})

describe('calcBalancerTokenPrice', () => {
  const usdTokenSupply = new BigNumber(1000);
  const tokenReserves = new BigNumber(10000);
  it('Token notional equal to reserves', () => {
    const bptTokenPrice = calcBptTokenPrice(usdTokenSupply, [
      {
        reserves: tokenReserves,
        usdPrice: new BigNumber(0.1)
      }
    ])
    expect(bptTokenPrice).to.be.bignumber.equal(1)
  })
  it('Token notional equal to reserves', () => {
    const bptTokenPrice = calcBptTokenPrice(usdTokenSupply, [
      {
        reserves: tokenReserves,
        usdPrice: new BigNumber(0.1)
      },
      {
        reserves: tokenReserves,
        usdPrice: new BigNumber(0.1)
      }
    ])
    expect(bptTokenPrice).to.be.bignumber.equal(2)
  })
  it('USD Supply is 0', () => {
    let bptTokenPrice = calcBptTokenPrice(ZERO, [])
    expect(bptTokenPrice).to.be.bignumber.equal(0)
    bptTokenPrice = calcBptTokenPrice(ZERO, [
      {
        reserves: tokenReserves,
        usdPrice: new BigNumber(0.1)
      }
    ])
    expect(bptTokenPrice).to.be.bignumber.equal(0)
  })
  it('No tokens', () => {
    let bptTokenPrice = calcBptTokenPrice(usdTokenSupply, [])
    expect(bptTokenPrice).to.be.bignumber.equal(0)
    bptTokenPrice = calcBptTokenPrice(usdTokenSupply)
    expect(bptTokenPrice).to.be.bignumber.equal(0)
  })
})

describe('calc Balance Token Spot Price', () => {
  const sellingToken = {
    weight: new BigNumber(0.5),
    balance: new BigNumber(1000)
  }
  const buyingToken = {
    weight: new BigNumber(0.5),
    balance: new BigNumber(1000)
  }
  it('Equal token weight and balance', () => {
    const spotPrice = calcBptTokenSpotPrice(sellingToken, buyingToken, ZERO)
    expect(spotPrice).to.be.bignumber.equal(1)
  })
  it('Equal token weight differing balances', () => {
    const cheaperSelling = {
      ...sellingToken,
      balance: new BigNumber(2000)
    }
    const cheaperBuying = {
      ...buyingToken,
      balance: new BigNumber(2000)
    }
    let spotPrice = calcBptTokenSpotPrice(cheaperSelling, buyingToken, ZERO)
    expect(spotPrice).to.be.bignumber.equal(2)
    spotPrice = calcBptTokenSpotPrice(sellingToken, cheaperBuying, ZERO)
    expect(spotPrice).to.be.bignumber.equal(0.5)
  })

  it('Higher weighted selling', () => {
    const weightedSelling = {
      ...sellingToken,
      weight: new BigNumber(0.8)
    }
    const weightedBuying = {
      ...buyingToken,
      weight: new BigNumber(0.2)
    }
    const spotPrice = calcBptTokenSpotPrice(weightedSelling, weightedBuying, ZERO)
    expect(spotPrice).to.be.bignumber.equal(0.25)
  })

  it('Higher weighted buying', () => {
    const weightedSelling = {
      ...sellingToken,
      weight: new BigNumber(0.2)
    }
    const weightedBuying = {
      ...buyingToken,
      weight: new BigNumber(0.8)
    }
    const spotPrice = calcBptTokenSpotPrice(weightedSelling, weightedBuying, ZERO)
    expect(spotPrice).to.be.bignumber.equal(4)
  })

  it('Zeroed weights', () => {
    const weightedSelling = {
      ...sellingToken,
      weight: ZERO,
    }
    const weightedBuying = {
      ...buyingToken,
      weight: ZERO
    }
    const spotPrice = calcBptTokenSpotPrice(weightedSelling, weightedBuying, ZERO)
    expect(spotPrice).to.be.bignumber.equal(0)
  })
  it('Zeroed balances', () => {
    const mock = jest.fn()
    console.error = mock;

    const weightedSelling = {
      ...sellingToken,
      balance: new BigNumber(0)
    }
    const weightedBuying = {
      ...buyingToken,
      balance: new BigNumber(0)
    }
    let spotPrice = calcBptTokenSpotPrice(weightedSelling, buyingToken, ZERO)
    expect(spotPrice).to.be.bignumber.equal(0)
    spotPrice = calcBptTokenSpotPrice(sellingToken, weightedBuying, ZERO)
    expect(spotPrice).to.be.bignumber.equal(0)
    spotPrice = calcBptTokenSpotPrice(weightedSelling, weightedBuying, ZERO)
    expect(spotPrice).to.be.bignumber.equal(0)

    expect(mock.mock.calls.length).to.equal(3)
  })
  it('With swapfee', () => {
    const weightedSelling = {
      ...sellingToken,
      weight: new BigNumber(0.8),
    }
    const weightedBuying = {
      ...buyingToken,
      weight: new BigNumber(0.2),
    }
    let spotPrice = calcBptTokenSpotPrice(sellingToken, buyingToken, new BigNumber(0.1))
    expect(spotPrice.toNumber()).to.be.bignumber.approximately(1.111, 0.001)
    spotPrice = calcBptTokenSpotPrice(weightedSelling, weightedBuying, new BigNumber(0.1))
    expect(spotPrice.toNumber()).to.be.bignumber.approximately(0.277, 0.001)
  })
})

describe('calcAPY', () => {
  it('100% APR', () => {
    const apy = calcAPY(new BigNumber(1))
    expect(apy.toNumber()).to.be.bignumber.approximately(1.692, 0.001)
  })
  it('200% APR', () => {
    const apy = calcAPY(new BigNumber(2))
    expect(apy.toNumber()).to.be.bignumber.approximately(6.117, 0.001)
  })
  it('0% APR', () => {
    const apy = calcAPY(ZERO)
    expect(apy.toNumber()).to.be.bignumber.equal(0)
  })
})

describe('getExpectedExecutionTimestamp', () => {
  describe('frontRunningInterval < updateInerval', () => {
    const frontRunningInterval = FIVE_MINUTES;
    const updateInterval = ONE_HOUR;
    const now = Date.now() / 1000; // put into seconds
    const commitCreated = now;

    it('Commit during regular updateInerval', () => {
      const lastUpdate = now - 10; // pool was just updated
      const nextUpdate = lastUpdate + updateInterval;

      const expectedExeuction = getExpectedExecutionTimestamp(
        frontRunningInterval,
        updateInterval,
        lastUpdate,
        commitCreated
      )
      expect(expectedExeuction).to.be.equal(nextUpdate);
    });
    it('Commit during frontRunningInterval', () => {
      const lastUpdate = now - updateInterval + 10; // Pool is 10 seconds from being upkeepable
      const nextUpdate = lastUpdate + updateInterval;

      const expectedExeuction = getExpectedExecutionTimestamp(
        frontRunningInterval,
        updateInterval,
        lastUpdate,
        commitCreated
      )

      expect(expectedExeuction).to.be.equal(nextUpdate + updateInterval);
    });
  }),

  describe('frontRunningInterval > updateInerval', () => {
    const frontRunningInterval = ONE_HOUR;
    let updateInterval = FIVE_MINUTES;
    const now = Math.floor(Date.now() / 1000); // put into seconds
    let commitCreated = now;

    it('oldCommit should be included next update', () => {
      let lastUpdate = now - 10; // pool was just updated
      let oldCommit = commitCreated - (12 * updateInterval)
      let nextUpdate = lastUpdate + updateInterval;

      let expectedExeuction = getExpectedExecutionTimestamp(
        frontRunningInterval,
        updateInterval,
        lastUpdate,
        oldCommit 
      )
      expect(expectedExeuction).to.be.equal(nextUpdate);
      lastUpdate = now;
      nextUpdate = lastUpdate + updateInterval;

      expectedExeuction = getExpectedExecutionTimestamp(
        frontRunningInterval,
        updateInterval,
        lastUpdate,
        oldCommit 
      )
      expect(expectedExeuction).to.be.equal(nextUpdate);

      lastUpdate = now + 1;
      nextUpdate = lastUpdate + updateInterval;
      expectedExeuction = getExpectedExecutionTimestamp(
        frontRunningInterval,
        updateInterval,
        lastUpdate,
        oldCommit 
      )
      expect(expectedExeuction).to.be.equal(nextUpdate - updateInterval); // should have already been executed

    })

    it('Commit during regular updateInerval', () => {
      const lastUpdate = now - 10; // pool was just updated
      let nextUpdate = lastUpdate + updateInterval;

      let expectedExeuction = getExpectedExecutionTimestamp(
        frontRunningInterval,
        updateInterval,
        lastUpdate,
        commitCreated
      )
      expect(expectedExeuction).to.be.equal(nextUpdate + (12 * updateInterval));

      updateInterval = FIVE_MINUTES - 1; // offset so it doesnt divide perfectly
      nextUpdate = lastUpdate + updateInterval;

      expectedExeuction = getExpectedExecutionTimestamp(
        frontRunningInterval,
        updateInterval,
        lastUpdate,
        commitCreated
      )
      expect(expectedExeuction).to.be.equal(nextUpdate + (13 * updateInterval));

      updateInterval = FIVE_MINUTES + 1; // offset so it doesnt divide perfectly
      nextUpdate = lastUpdate + updateInterval;

      expectedExeuction = getExpectedExecutionTimestamp(
        frontRunningInterval,
        updateInterval,
        lastUpdate,
        commitCreated
      )
      expect(expectedExeuction).to.be.equal(nextUpdate + (12 * updateInterval));


    });
    it('Commit close to updateInterval', () => {
      const lastUpdate = now - updateInterval + 10; // Pool is 10 seconds from being upkeepable
      let nextUpdate = lastUpdate + updateInterval;
      let oldCommit = commitCreated - (2 * updateInterval)

      let expectedExeuction = getExpectedExecutionTimestamp(
        frontRunningInterval,
        updateInterval,
        lastUpdate,
        commitCreated
      )
      expect(expectedExeuction).to.be.equal(nextUpdate + (12 * updateInterval));
      
      expectedExeuction = getExpectedExecutionTimestamp(
        frontRunningInterval,
        updateInterval,
        lastUpdate,
        oldCommit 
      )
      expect(expectedExeuction).to.be.equal(nextUpdate + (10 * updateInterval));


      updateInterval = FIVE_MINUTES - 1; // offset so it doesnt divide perfectly
      nextUpdate = lastUpdate + updateInterval;

      expectedExeuction = getExpectedExecutionTimestamp(
        frontRunningInterval,
        updateInterval,
        lastUpdate,
        commitCreated
      )
      expect(expectedExeuction).to.be.equal(nextUpdate + (13 * updateInterval));

      expectedExeuction = getExpectedExecutionTimestamp(
        frontRunningInterval,
        updateInterval,
        lastUpdate,
        oldCommit 
      )
      expect(expectedExeuction).to.be.equal(nextUpdate + (11 * updateInterval));

      updateInterval = FIVE_MINUTES + 1; // offset so it doesnt divide perfectly
      nextUpdate = lastUpdate + updateInterval;

      expectedExeuction = getExpectedExecutionTimestamp(
        frontRunningInterval,
        updateInterval,
        lastUpdate,
        commitCreated
      )
      expect(expectedExeuction).to.be.equal(nextUpdate + (12 * updateInterval));

      expectedExeuction = getExpectedExecutionTimestamp(
        frontRunningInterval,
        updateInterval,
        lastUpdate,
        oldCommit 
      )
      expect(expectedExeuction).to.be.equal(nextUpdate + (10 * updateInterval));
    });

  }),
  describe('frontRunningInterval == updateInerval', () => {
    const frontRunningInterval = FIVE_MINUTES;
    const updateInterval = FIVE_MINUTES;
    const now = Date.now() / 1000; // put into seconds
    const commitCreated = now;

    // will always be included next update interval
    it('Commit during regular updateInerval', () => {
      const lastUpdate = now - 10; // pool was just updated
      const nextUpdate = lastUpdate + updateInterval;

      const expectedExeuction = getExpectedExecutionTimestamp(
        frontRunningInterval,
        updateInterval,
        lastUpdate,
        commitCreated
      )
      expect(expectedExeuction).to.be.equal(nextUpdate + updateInterval);
    });
    it('Commit close to updateInterval', () => {
      const lastUpdate = now - updateInterval + 10; // Pool is 10 seconds from being upkeepable
      const nextUpdate = lastUpdate + updateInterval;
      const expectedExeuction = getExpectedExecutionTimestamp(
        frontRunningInterval,
        updateInterval,
        lastUpdate,
        commitCreated
      )
      expect(expectedExeuction).to.be.equal(nextUpdate + updateInterval);
    });
  })
});
