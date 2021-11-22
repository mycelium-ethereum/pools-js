jest.mock('ethers');
jest.mock('../src/entities/token')
jest.mock('../src/entities/poolToken')
jest.mock('../src/entities/committer')

import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
const { utils } = jest.requireActual('ethers');
ethers.utils = utils;

import Committer from '../src/entities/committer';
import Pool from '../src/entities/pool'
import PoolToken from '../src/entities/poolToken';
import Token from '../src/entities/token';
import { StaticTokenInfo } from '../src/types';

const ONE_HOUR = 3600; // seconds
const FIVE_MINUTES = 300; // seconds
const USDC_TOKEN_DECIMALS = 6;

const expected = {
	longBalance: 200,
	shortBalance: 100,
	lastPrice: 1,
	oraclePrice: 1,
	lastPriceTimestamp: 1,
}

const USDC: StaticTokenInfo = {
	name: 'USD Coin (Arb1)',
	symbol: 'USDC',
	decimals: 6,
	address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
}
interface TestConfig {
	name: string;
	address: string;
	keeper: string;
	committer: {
		address: string;
		minimumCommitSize: 1000;
	}
	leverage: number;
	updateInterval: number;
	frontRunningInterval: number;
	longToken: StaticTokenInfo;
	shortToken: StaticTokenInfo;
	quoteToken: StaticTokenInfo;
	lastPriceTimestamp: number;
	lastPrice: number;
	shortBalance: number;
	longBalance: number;
	oraclePrice: number;
}
const poolConfig: TestConfig = {
	name: '3-ETH/USDC',
	address: '0x54114e9e1eEf979070091186D7102805819e916B',
	leverage: 3,
	updateInterval: ONE_HOUR,
	frontRunningInterval: FIVE_MINUTES,
	keeper: '0x759E817F0C40B11C775d1071d466B5ff5c6ce28e',
	committer: {
		address: '0x72c4e7Aa6c743DA4e690Fa7FA66904BC3f2C9C04',
		minimumCommitSize: 1000
	},
	longToken: {
		name: '3L-ETH/USD',
		address: '0xaA846004Dc01b532B63FEaa0b7A0cB0990f19ED9',
		symbol: '3L-ETH/USD',
		decimals: USDC_TOKEN_DECIMALS,
	},
	shortToken: {
		name: '3S-ETH/USD',
		address: '0x7d7E4f49a29dDA8b1eCDcf8a8bc85EdcB234E997',
		symbol: '3S-ETH/USD',
		decimals: USDC_TOKEN_DECIMALS,
	},
	quoteToken: USDC,
	lastPriceTimestamp: expected.lastPriceTimestamp,
	lastPrice: utils.parseEther(expected.lastPrice.toString()),
	shortBalance: utils.parseUnits(expected.shortBalance.toString(), USDC.decimals),
	longBalance: utils.parseUnits(expected.longBalance.toString(), USDC.decimals),
	oraclePrice: utils.parseEther(expected.oraclePrice.toString()),
}

const createPool = async (address: string, config?: TestConfig) => (
	config
		? Pool.Create({
			...config,
			address: address,
			provider: new ethers.providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc')
		})
		: Pool.Create({
			address: address,
			provider: new ethers.providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc')
		})
)


const assertPool: (pool: Pool) => void = (pool) => {
	expect(pool.name).toEqual(poolConfig.name)
	expect(pool.address).toEqual(poolConfig.address)
	expect(pool.keeper).toEqual(poolConfig.keeper);
	expect(pool.frontRunningInterval.toNumber()).toEqual(poolConfig.frontRunningInterval)
	expect(pool.updateInterval.toNumber()).toEqual(poolConfig.updateInterval)
	expect(pool.longBalance.toNumber()).toEqual(200)
	expect(pool.shortBalance.toNumber()).toEqual(100)
	expect(pool.leverage).toEqual(poolConfig.leverage)
	expect(pool.lastPrice.toNumber()).toEqual(1)
	expect(pool.oraclePrice.toNumber()).toEqual(1)

}

const mockPool = {
	// pool functions
	lastPriceTimestamp: () => Promise.resolve(poolConfig.lastPriceTimestamp),
	shortBalance: () => Promise.resolve( poolConfig.shortBalance),
	longBalance: () => Promise.resolve( poolConfig.longBalance),
	getOraclePrice: () => Promise.resolve( poolConfig.oraclePrice),
	poolCommitter: () => Promise.resolve( poolConfig.committer.address),
	keeper: () => Promise.resolve( poolConfig.keeper),
	updateInterval: () => Promise.resolve( poolConfig.updateInterval),
	frontRunningInterval: () => Promise.resolve( poolConfig.frontRunningInterval),
	poolName: () => Promise.resolve( poolConfig.name),
	tokens: (num: number) => Promise.resolve(num === 0 ? poolConfig.longToken.address : poolConfig.shortToken.address),
	quoteToken: () => Promise.resolve( poolConfig.quoteToken.address),

	// keeper functions
	executionPrice: () => Promise.resolve( poolConfig.lastPrice)

}

beforeEach(() => {
	// @ts-ignore
	ethers.Contract.mockImplementation(() => ({
		...mockPool
	}))
	// @ts-ignore
	Token.Create.mockImplementation(() => ({
		decimals: poolConfig.quoteToken.decimals
	}))
})

describe('Testing pool constructor', () => {
	// can just ignore these functions test in isolation
	// @ts-ignore
	PoolToken.Create.mockImplementation(() => null)
	// @ts-ignore
	Committer.Create.mockImplementation(() => null)

	it('No input', () => {
		return createPool(poolConfig.address).then((pool) => (
			assertPool(pool)
		))
	});
	it('Full input', async () => {
		return (
			createPool(poolConfig.address, poolConfig).then((pool) => (
				assertPool(pool)
			))
		)
	});
	it('Creating default', () => {
		const pool = Pool.CreateDefault();
		expect(pool.address).toEqual('')
		expect(pool.name).toEqual('')
		expect(pool.keeper).toEqual('')
		expect(pool.updateInterval.toNumber()).toEqual(0)
		expect(pool.lastUpdate.toNumber()).toEqual(0)
		expect(pool.lastPrice.toNumber()).toEqual(0)
		expect(pool.shortBalance.toNumber()).toEqual(0)
		expect(pool.longBalance.toNumber()).toEqual(0)
	})
});

describe('Calculating token prices', () => {
	// @ts-ignore
	PoolToken.Create.mockImplementation(() => ({
		supply: new BigNumber(1000),
		...poolConfig.longToken
	}))

	it('No price change or burns', () => {
		// @ts-ignore
		Committer.Create.mockImplementation(() => ({
			pendingShort: {
				burn: 0
			}, pendingLong: {
				burn: 0
			}
		}))
		return (
			createPool(poolConfig.address, poolConfig).then((pool) => {
				expect(pool.getLongTokenPrice().toNumber()).toEqual(0.2)
				expect(pool.getShortTokenPrice().toNumber()).toEqual(0.1)
				expect(pool.getNextLongTokenPrice().toNumber()).toEqual(0.2)
				expect(pool.getNextShortTokenPrice().toNumber()).toEqual(0.1)
			})
		)
	});
	it('10% Price Change up', () => {
		// @ts-ignore
		ethers.Contract.mockImplementation(() => ({
			...mockPool,
			getOraclePrice: () => Promise.resolve(ethers.utils.parseEther('1.1'))
		}))
		return (
			createPool(poolConfig.address, poolConfig).then((pool) => {

				const { shortValueTransfer, longValueTransfer } = pool.getNextValueTransfer();
				expect(parseFloat(shortValueTransfer.toFixed(2))).toEqual(-24.87)
				expect(parseFloat(longValueTransfer.toFixed(2))).toEqual(24.87)

				expect(pool.getLongTokenPrice().toNumber()).toEqual(0.2)
				expect(pool.getShortTokenPrice().toNumber()).toEqual(0.1)
				expect(parseFloat(pool.getNextLongTokenPrice().toFixed(2))).toEqual(0.22)
				expect(parseFloat(pool.getNextShortTokenPrice().toFixed(2))).toEqual(0.08)
			})
		)
	})

	it('10% Price Change with pending burns', () => {
		// values should be the same as above since we are only burning 100 from each
		// @ts-ignore
		ethers.Contract.mockImplementation(() => ({
			...mockPool,
			getOraclePrice: () => Promise.resolve(ethers.utils.parseEther('1.1'))
		}))
		// @ts-ignore
		Committer.Create.mockImplementation(() => ({
			pendingShort: {
				burn: 100
			}, pendingLong: {
				burn: 100
			}
		}))
		// @ts-ignore
		PoolToken.Create.mockImplementation(() => ({
			supply: new BigNumber(900),
			...poolConfig.longToken
		}))
		return (
			createPool(poolConfig.address, poolConfig).then((pool) => {

				const { shortValueTransfer, longValueTransfer } = pool.getNextValueTransfer();
				expect(parseFloat(shortValueTransfer.toFixed(2))).toEqual(-24.87)
				expect(parseFloat(longValueTransfer.toFixed(2))).toEqual(24.87)

				expect(pool.getLongTokenPrice().toNumber()).toEqual(0.2)
				expect(pool.getShortTokenPrice().toNumber()).toEqual(0.1)
				expect(parseFloat(pool.getNextLongTokenPrice().toFixed(2))).toEqual(0.22)
				expect(parseFloat(pool.getNextShortTokenPrice().toFixed(2))).toEqual(0.08)
			})
		)
	})
})