import { BigNumber } from 'bignumber.js';

const UP = 1;
const DOWN = 2;
const NO_CHANGE = 3;

/**
 * Calculate the losing pool multiplier
 * @param newPrice new market price
 * @param oldPrice old market price
 * @param leverage pool leverage
 * @returns ratio if the price direction is down and the inverse of ratio if it is up
 */
export const calcLossMultiplier: (oldPrice: BigNumber, newPrice: BigNumber) => BigNumber = (oldPrice, newPrice) => {
    const ratio = calcRatio(oldPrice, newPrice);
    const direction = calcDirection(oldPrice, newPrice);
    return direction.eq(UP) // number go up
        ? new BigNumber(1).div(ratio)
        : ratio;
};

/**
 * Calculates the effective multiplier returns for the longs. This amount varies depending on the skew between the long and short balances.
 * Gain and loss refer to whether the pool is receiving tokens from the other pool or transferring tokens to the opposite pool.
 * If there is more balance in the long pool than the short pools, you would expect the short pool to have
 *  `effectiveLongGain > leverage`.
 * Both sides of the pool will always have an effectiveLoss lower limit at leverage, ie you can never have `effectiveLoss < leverage`.
 * @param longBalance quote balance of the long pool in quote units (eg USD)
 * @param shortBalance quote balance of the short pool in quote units (eg USD)
 * @param leverage pool leverage
 * @returns the effective winning returns to the long pool on next rebalance
 */
export const calcEffectiveLongGain: (shortBalance: BigNumber, longBalance: BigNumber, leverage: BigNumber) => BigNumber = (shortBalance, longBalance, leverage) => (
    (new BigNumber(1).div(calcSkew(shortBalance, longBalance))).times(leverage)
)


/**
 * Calculates the effective gains multiplier for the shorts. This amount varies depending on the skew between the long and short balances.
 * Gain and loss refer to whether the pool is receiving tokens from the other pool or transferring tokens to the opposite pool.
 * If there is more balance in the long pool than the short pools, you would expect the short pool to have
 *  `effectiveLongGain > leverage`.
 * The pools effective losses will always have a lower limit at leverage, ie you can never have `effectiveLoss < leverage`.
 * @param longBalance quote balance of the long pool in USD
 * @param shortBalance quote balance of the short pool in USD
 * @param leverage pool leverage
 * @returns the effective gains to the short pool on next rebalance
 */
export const calcEffectiveShortGain: (shortBalance: BigNumber, longBalance: BigNumber, leverage: BigNumber) => BigNumber = (shortBalance, longBalance, leverage) => (
    calcSkew(shortBalance, longBalance).times(leverage)
)

// weekly -> 52
const COMPOUND_FREQUENCY = 52;

/**
 * Calculates the compounding gains
 * @param apr annual percentage rate as a decimal
 *  eg 1 is a 100% apr
 * @returns annual percentage yield coumpounded weekly
 */
export const calcAPY: (apr: BigNumber) => BigNumber = (apr) => {
    BigNumber.config({ POW_PRECISION: 10 })
    const apy =  apr.div(COMPOUND_FREQUENCY).plus(1).pow(COMPOUND_FREQUENCY).minus(1);
    BigNumber.config({ POW_PRECISION: 0 })
    return apy;
}
/**
 *
 * Calculates the leverage multiplier of the losing pool.
 * This multiplier is used to {@linkcode calcLeverageLossTransfer| calculate the percentage loss transfer} between the pools.
 * @param newPrice new market price
 * @param oldPrice old market price
 * @param leverage pool leverage
 * @returns ratio^leverage if the price direction is down and the (1/ratio)^leverage if it is up
 */
export const calcLeverageLossMultiplier: (oldPrice: BigNumber, newPrice: BigNumber, leverage: BigNumber) => BigNumber =
    (oldPrice, newPrice, leverage) => {
        return calcLossMultiplier(oldPrice, newPrice).pow(leverage);
    };

/**
 * Calculates the percentage the losing pool must transfer to the winning pool on next upKeep.
 * @param oldPrice old market price
 * @param newPrice new market price
 * @param leverage pool leverage
 * @returns the percentage loss transfer as a decimal
 */
export const calcPercentageLossTransfer: (oldPrice: BigNumber, newPrice: BigNumber, leverage: BigNumber) => BigNumber =
    (oldPrice, newPrice, leverage) => {
        return new BigNumber(1).minus(calcLeverageLossMultiplier(oldPrice, newPrice, leverage));
    };

/**
 * Calculates the notional value of tokens
 * @param tokenPrice current price of tokens
 * @param numTokens number of tokens
 * @returns notional value of the tokens
 */
export const calcNotionalValue: (tokenPrice: BigNumber, numTokens: BigNumber) => BigNumber = (
    tokenPrice,
    numTokens,
) => {
    return tokenPrice.times(numTokens);
};

/**
 * Calculates the ratio of the old price to the new price
 * @param oldPrice old market price
 * @param newPrice new market price
 */
export const calcRatio: (oldPrice: BigNumber, newPrice: BigNumber) => BigNumber = (oldPrice, newPrice) => {
    if (oldPrice.eq(0)) return new BigNumber(0)
    return newPrice.div(oldPrice);
};

export const calcSkew: (shortBalance: BigNumber, longBalance: BigNumber) => BigNumber = (shortBalance, longBalance) => {
    if (shortBalance.eq(0) || longBalance.eq(0)) {
        // This isnt a fully accurate return since
        //  at shortBalance 0 there there will be incentive to short
        //  and vice versa for longs
        return new BigNumber(1);
    }
    return longBalance.div(shortBalance);
};

export const calcRebalanceRate: (shortBalance: BigNumber, longBalance: BigNumber) => BigNumber = (
    shortBalance,
    longBalance,
) => {
    return calcSkew(shortBalance, longBalance).minus(1);
};

/**
 * Calcualtes the direction of the price movement
 * @param newPrice new market price
 * @param oldPrice old market price
 * @return DOWN (2) if oldPrice > newPrice, NO_CHANGE (3) if newPrice = oldPrice, or UP (1) if newPrice > oldPrice
 */
export const calcDirection: (oldPrice: BigNumber, newPrice: BigNumber) => BigNumber = (oldPrice, newPrice) => {
    // newPrice.div(oldPrice);
    const priceRatio = calcRatio(oldPrice, newPrice);
    if (priceRatio.gt(1)) {
        // number go up
        return new BigNumber(UP);
    } else if (priceRatio.eq(1)) {
        return new BigNumber(NO_CHANGE);
    } else {
        // priceRatio.lt(1)
        return new BigNumber(DOWN);
    }
};

/**
 * Calc minimum amount in to sell
 * @param totalSupply total token supply
 * @param tokenBalance token balance
 * @param minimumCommitSize
 * @param pendingCommits accumulative commit amounts
 * @returns Minimum amount in
 */
export const calcMinAmountIn: (
    totalSupply: BigNumber,
    tokenBalance: BigNumber,
    minimumCommitSize: BigNumber,
    pendingCommits: BigNumber,
) => BigNumber = (totalSupply, tokenBalance, minimumCommitSize, pendingCommits) => {
    // minumumCommitSize = (balance * amountIn) / tokenSupply + shadowPool
    // (minimumCommitSize * (tokenSupply + shadowPool)) / balance
    return minimumCommitSize.times(totalSupply.plus(pendingCommits)).div(tokenBalance.minus(minimumCommitSize));
};

/**
 * Calculate the pool tokens price
 * Since totalQuoteValue will generally be in USD the returned amount
 *  will also be in USD
 */
export const calcTokenPrice: (totalQuoteValue: BigNumber, tokenSupply: BigNumber) => BigNumber = (
    totalQuoteValue,
    tokenSupply,
) => {
    // if supply is 0 priceRatio is 1/1
    if (tokenSupply.eq(0) || totalQuoteValue.eq(0)) {
        return new BigNumber(1);
    }
    return totalQuoteValue.div(tokenSupply);
};

/**
 * Calculates how much value will be transferred between the pools
 *
 * @param oldPrice old market price
 * @param newPrice new market price
 * @param leverage pool leverage
 * @param longBalance quote balance of the long pool in USD
 * @param shortBalance quote balance of the short pool in USD
 *
 * returns an object containing longValueTransfer and shortValueTransfer
 */
export const calcNextValueTransfer: (
    oldPrice: BigNumber,
    newPrice: BigNumber,
    leverage: BigNumber,
    longBalance: BigNumber,
    shortBalance: BigNumber,
) => {
    longValueTransfer: BigNumber;
    shortValueTransfer: BigNumber;
} = (oldPrice, newPrice, leverage, longBalance, shortBalance) => {
    const direction = calcDirection(oldPrice, newPrice);
    const percentageLossTransfer = calcPercentageLossTransfer(oldPrice, newPrice, leverage);
    let gain: BigNumber;

    if (direction.eq(UP)) {
        // long wins
        gain = percentageLossTransfer.times(shortBalance);
        // long gains and short loses longs gain
        return {
            longValueTransfer: gain,
            shortValueTransfer: gain.negated(),
        };
    } else if (direction.eq(DOWN)) {
        // short wins
        gain = percentageLossTransfer.times(longBalance).abs();
        return {
            longValueTransfer: gain.negated(),
            shortValueTransfer: gain,
        };
    } // else no value transfer
    return {
        longValueTransfer: new BigNumber(0),
        shortValueTransfer: new BigNumber(0),
    };
};

/**
 * Calculates the Balancer LP token price given a list of tokens included in the pool
 * @param tokens list of tokens included in the balancer pool
 * @returns 0 if no tokens are given, if the tokens have no USDC value or if the stakingToken supply is 0
 * 	otherwise returns the price of the LP token.
 */
export const calcBptTokenPrice: (
    usdTokenSupply: BigNumber,
	tokens?: {
		reserves: BigNumber;
		usdPrice: BigNumber;
	}[]
) => BigNumber = (stakingTokenSupply, tokens) => {
    if (!tokens) {
        return new BigNumber(0);
    }

    let balancerPoolUSDValue = new BigNumber(0);

    for (const token of tokens) {
        const tokenUSDValue = calcNotionalValue(token.usdPrice, token.reserves)
        balancerPoolUSDValue = balancerPoolUSDValue.plus(tokenUSDValue);
    }

    if (balancerPoolUSDValue.eq(0) || stakingTokenSupply.eq(0)) {
        return new BigNumber(0);
    }

    return balancerPoolUSDValue.div(stakingTokenSupply);
};

/**
 * Calculates the trade price between two Balancer tokens.
 * This price is dependent on the reserves deposited on each side
 *  within the Balancer pool, as well as the weighting of each.
 * @param sellingToken weight and balance of token that is being sold
 * @param buyingToken weight and balance of token that is being bought
 * @param swapFee percentage swap fee in decimals
 * @returns
 */
export const calcBptTokenSpotPrice: (
    sellingToken: {
        weight: BigNumber,
        balance: BigNumber
    },
    buyingToken: {
        weight: BigNumber,
        balance: BigNumber
    },
    swapFee: BigNumber
) => BigNumber = (sellingToken, buyingToken, swapFee) => {
    if (sellingToken.weight.eq(0) || buyingToken.weight.eq(0)) return new BigNumber(0)
    if (sellingToken.balance.eq(0) || buyingToken.balance.eq(0)) {
        console.error("Selling token balance zero")
        return new BigNumber(0)
    }
    const numerator = sellingToken.balance.div(sellingToken.weight);
    const denominator = buyingToken.balance.div(buyingToken.weight);
    const swapFeeMultiplier = new BigNumber(1).div(new BigNumber(1).minus(swapFee))

    return (numerator.div(denominator)).times(swapFeeMultiplier);
}


/**
 * Calculate the expected execution given a commit timestamp, the frontRunningInterval, updateInterval and lastUpdate.
 *  This is just an estimate as there is a slight delay between possibleExecution and finalExecutionTimestamp
 */
export const getExpectedExecutionTimestamp: (frontRunningInterval: number, updateInterval: number, lastUpdate: number, commitCreated: number) => number = (
    frontRunningInterval, updateInterval,
    lastUpdate, commitCreated
) => {
    const nextRebalance = lastUpdate + updateInterval;

    // for frontRunningInterval <= updateInterval this will be 1
    //  anything else will give us how many intervals we need to wait
    //  such that waitingTime >= frontRunningInterval
    let numberOfUpdateInteravalsToWait = Math.ceil(frontRunningInterval / updateInterval);

    // if numberOfUpdateInteravalsToWait is 1 then frontRunningInterval <= updateInterval
    //  for frontRunningInterval < updateInterval 
    //   set numberOfWaitIntervals to 0 since there is potential it CAN be included next updateInterval
    //  for frontRunningInterval === updateInterval
    //   the commit will be appropriately caught by the condition
    //      (potentialExecutionTime - commitCreated) < frontRunningInterval
    //      = nextRebalance - commitCreated < frontRunningInterval
    //      = lastUpdate + updateInterval - commitCreated < frontRunningInterval
    //      = lastUpdate + updateInterval < frontRunningInterval + commitCreated
    //      = lastUpdate + updateInterval < updateInterval + commitCreated
    //      = lastUpdate < commitCreated
    //   and will always be included in the following updateInterval unless lastUpdate < commitCreated
    if (numberOfUpdateInteravalsToWait === 1) {
        numberOfUpdateInteravalsToWait = 0
    }

    const potentialExecutionTime = nextRebalance + (numberOfUpdateInteravalsToWait * updateInterval);

    // only possible if frontRunningInterval < updateInterval 
    if ((potentialExecutionTime - commitCreated) < frontRunningInterval) { // commit was created during frontRunningInterval
        return potentialExecutionTime + updateInterval // commit will be executed in the following updateInterval
    } else {
        return potentialExecutionTime;
    }
}
