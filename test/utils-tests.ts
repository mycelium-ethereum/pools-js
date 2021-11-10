const chai = require('chai')
const { expect, use } = chai;

//use default BigNumber
use(require('chai-bignumber')());


import { BigNumber } from 'bignumber.js';

import {
  calcPercentageLossTransfer,
  calcNextValueTransfer,
  calcTokenPrice
} from "../src/utils";

const TOKEN_SUPPLY = new BigNumber(1000000000);

describe('calcTokenPrice', () => {
  it('no deposits', () => {
    // starting token price is 1
    const tokenPrice = calcTokenPrice(new BigNumber(0), TOKEN_SUPPLY)
    expect(tokenPrice).to.be.bignumber.equal(1);
  });
  it('no supply', () => {
    // price ratio 1/1
    const tokenPrice = calcTokenPrice(new BigNumber(1000), new BigNumber(0))
    expect(tokenPrice).to.be.bignumber.equal(1);
  });
});

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