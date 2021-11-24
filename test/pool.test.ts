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
	longBalance: new BigNumber(200),
	shortBalance: new BigNumber(100),
	lastPrice: new BigNumber(1),
	oraclePrice: new BigNumber(1),
	lastPriceTimestamp: 1,
	frontRunningInterval: new BigNumber(FIVE_MINUTES),
	updateInterval: new BigNumber(ONE_HOUR),
	leverage: 3
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
	leverage: expected.leverage,
	updateInterval: expected.updateInterval.toNumber(),
	frontRunningInterval: expected.frontRunningInterval.toNumber(),
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
	expect(pool.frontRunningInterval).toEqual(expected.frontRunningInterval)
	expect(pool.updateInterval).toEqual(expected.updateInterval)
	expect(pool.longBalance).toEqual(expected.longBalance)
	expect(pool.shortBalance).toEqual(expected.shortBalance)
	expect(pool.leverage).toEqual(expected.leverage)
	expect(pool.lastPrice).toEqual(expected.lastPrice)
	expect(pool.oraclePrice).toEqual(expected.oraclePrice)

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
	it('Creating default', async () => {
		const pool = Pool.CreateDefault();
		expect(pool.address).toEqual('')
		expect(pool.name).toEqual('')
		expect(pool.keeper).toEqual('')
		expect(pool.updateInterval.toNumber()).toEqual(0);
		expect(pool.lastUpdate.toNumber()).toEqual(0);
		expect(pool.lastPrice.toNumber()).toEqual(0);
		expect(pool.shortBalance.toNumber()).toEqual(0);
		expect(pool.longBalance.toNumber()).toEqual(0);
		await expect(async () => pool.fetchPoolBalances())
			.rejects
			.toThrow('Failed to update pool balances: this._contract undefined')
		await expect(async () => pool.fetchOraclePrice())
			.rejects
			.toThrow('Failed to fetch the pools oracle price: this._contract undefined')
		await expect(async () => pool.fetchLastPrice())
			.rejects
			.toThrow('Failed to fetch pools last price: this._keeper undefined')
		await expect(async () => pool.fetchLastPriceTimestamp())
			.rejects
			.toThrow('Failed to fetch pools last price timestamp: this._contract undefined')
		expect(() => pool.connect(null)).toThrow('Failed to connect LeveragedPool: provider cannot be undefined')
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
				const expectedValueTransfer = new BigNumber('24.8685199098422238915852742299023290758825694966190833959429') 
				expect(shortValueTransfer).toEqual(expectedValueTransfer.negated())
				expect(longValueTransfer).toEqual(expectedValueTransfer)

				const expectedShortTokenPrice = new BigNumber('0.07513148009015777611')
				const expectedLongTokenPrice = new BigNumber('0.22486851990984222389')
				expect(pool.getLongTokenPrice().toNumber()).toEqual(0.2)
				expect(pool.getShortTokenPrice().toNumber()).toEqual(0.1)
				expect(pool.getNextLongTokenPrice()).toEqual(expectedLongTokenPrice)
				expect(pool.getNextShortTokenPrice()).toEqual(expectedShortTokenPrice)
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
				const expectedValueTransfer = new BigNumber('24.8685199098422238915852742299023290758825694966190833959429') 
				expect(shortValueTransfer).toEqual(expectedValueTransfer.negated())
				expect(longValueTransfer).toEqual(expectedValueTransfer)

				expect(pool.getLongTokenPrice().toNumber()).toEqual(0.2)
				expect(pool.getShortTokenPrice().toNumber()).toEqual(0.1)
				const expectedShortTokenPrice = new BigNumber('0.07513148009015777611')
				const expectedLongTokenPrice = new BigNumber('0.22486851990984222389')
				expect(pool.getNextLongTokenPrice()).toEqual(expectedLongTokenPrice)
				expect(pool.getNextShortTokenPrice()).toEqual(expectedShortTokenPrice)
			})
		)
	})
})

describe('Calculating getNextPoolState', () => {
	beforeEach(() => {
		// @ts-ignore
		Committer.Create.mockImplementation(() => ({
			pendingLong: {
				mint: new BigNumber(100),
				burn: new BigNumber(50),
			},
			pendingShort: {
				mint: new BigNumber(0),
				burn: new BigNumber(0),
			},
		}))

		// @ts-ignore
		PoolToken.Create.mockImplementation(() => ({
			supply: new BigNumber(1000),
			...poolConfig.longToken
		}))
	})


	it('Price goes up', async () => {
		// @ts-ignore
		ethers.Contract.mockImplementation(() => ({
			...mockPool,
			getOraclePrice: () => Promise.resolve(ethers.utils.parseEther('1.1')),
		}))
		const pool = await createPool(poolConfig.address);
		const nextPoolState = pool.getNextPoolState();

		const expectedPoolState = {
			longBalance: new BigNumber('314.1604951522306894205852742299023290758825694966190833959429'),
			shortBalance: new BigNumber('75.1314800901577761084147257700976709241174305033809166040571'),
			longTokenPrice: new BigNumber('0.21416049515223068942'),
			shortTokenPrice: new BigNumber('0.07513148009015777611'),
			skew: new BigNumber('4.18147619047619047618')
		}

		// this is currentLongBalance +- valueTransfer + pendingMints - (pendingBurns * nextTokenPrice)
		// 	where nextTokenPrice = (currentLongBalance +- valueTransfer) / (tokenSupply + pendingBurns)
		// 	the additional + pendingBurns to tokenSupply is only because the tokenSupply gets reduced on burns
		// 	but the nextTokenPrice is calculated as if the burn has not already occurred
		// The supply for the longToken will be 1050 since the mocks have the supply set to 1000
		// 	as well as a pendingBurn amount of 50. This is because if it was actually fetching the supply
		// 	from the contracts, the supply would be 950 if a burn of amount 50 occurred when
		//	the token supply was at 1000
		expect(nextPoolState.expectedLongBalance).toEqual(expectedPoolState.longBalance)
		expect(nextPoolState.newLongTokenPrice).toEqual(expectedPoolState.longTokenPrice)

		// this is the same calc except there is no pending commits so it should just be
		// shortBalance +- valueTransfer
		expect(nextPoolState.expectedShortBalance).toEqual(expectedPoolState.shortBalance)
		expect(nextPoolState.newShortTokenPrice).toEqual(expectedPoolState.shortTokenPrice)

		// this is very high
		expect(nextPoolState.expectedSkew).toEqual(expectedPoolState.skew)
	})
	it('Price goes down', async () => {
		// @ts-ignore
		ethers.Contract.mockImplementation(() => ({
			...mockPool,
			getOraclePrice: () => Promise.resolve(ethers.utils.parseEther('0.9')),
		}))
		const pool = await createPool(poolConfig.address);
		const nextPoolState = pool.getNextPoolState();

		const expectedPoolState = {
			longBalance: new BigNumber('238.857142857142857143'),
			shortBalance: new BigNumber('154.2'),
			longTokenPrice: new BigNumber('0.13885714285714285714'),
			shortTokenPrice: new BigNumber('0.1542'),
			skew: new BigNumber('1.54900870854178247174')
		}

		// this time the value transfer goes to the shorts
		// since there is already a large skew, the shorts will see a greater gain
		// 	than 3x
		// the value transfer in this case is around $54
		expect(nextPoolState.expectedLongBalance).toEqual(expectedPoolState.longBalance)
		expect(nextPoolState.newLongTokenPrice).toEqual(expectedPoolState.longTokenPrice)

		expect(nextPoolState.expectedShortBalance).toEqual(expectedPoolState.shortBalance)
		expect(nextPoolState.newShortTokenPrice).toEqual(expectedPoolState.shortTokenPrice)

		// this is very high
		expect(nextPoolState.expectedSkew).toEqual(expectedPoolState.skew)
	})
})