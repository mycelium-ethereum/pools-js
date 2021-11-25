jest.mock('ethers');

import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
const { utils } = jest.requireActual('ethers');
ethers.utils = utils;

import PoolToken from '../src/entities/poolToken';
import Token from '../src/entities/token';
import { SideEnum, StaticTokenInfo } from '../src/types';

const expectedTokenInfo = {
	tokenSupply: new BigNumber(1000),
	pool: '0xPoolAddress',
	address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
	name: 'Test Token',
	symbol: 'TEST',
	decimals: 18,
	side: SideEnum.short
}

const expectedDefault = {
	tokenSupply: new BigNumber(0),
	pool: '',
	address: '',
	name: '',
	symbol: '',
	decimals: 18,
	side: SideEnum.long
}

const poolTokenInfo = {
	...expectedTokenInfo,
	supply: ethers.utils.parseEther(expectedTokenInfo.tokenSupply.toString()),
}

const provider = new ethers.providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');

const createToken: (poolToken?: boolean, config?: StaticTokenInfo) => Promise<PoolToken | Token> = async (poolToken, config) => {
	if (poolToken) {
		return (
			config	
				? PoolToken.Create({
					...config,
					address: expectedTokenInfo.address,
					provider: provider,
					pool: poolTokenInfo?.pool,
					side: poolTokenInfo.side
				})
				: PoolToken.Create({
					address: expectedTokenInfo.address,
					provider: provider,
					pool: poolTokenInfo?.pool,
					side: poolTokenInfo.side
				})
		)
	} else {
		return (
			config	
				? Token.Create({
					...config,
					address: expectedTokenInfo.address,
					provider: provider,
				})
				: Token.Create({
					address: expectedTokenInfo.address,
					provider: provider,
				})
		)

	}
}


const assertToken: (token: Token | PoolToken, expectedTokenInfo: StaticTokenInfo) => void = (token, expectedTokenInfo) => {
	expect(token.name).toEqual(expectedTokenInfo.name)
	expect(token.address).toEqual(expectedTokenInfo.address)
	expect(token.symbol).toEqual(expectedTokenInfo.symbol)
	expect(token.decimals).toEqual(expectedTokenInfo.decimals)
}

const assertPoolToken: (token: PoolToken, poolTokenInfo: {
	tokenSupply: BigNumber,
	pool: string,
	side: SideEnum
}) => void = (token, poolTokenInfo) => {
	expect(token.supply).toEqual(poolTokenInfo.tokenSupply)
	expect(token.pool).toEqual(poolTokenInfo.pool)
	expect(token.side).toEqual(poolTokenInfo.side)
}

const mockToken = {
	// token functions
	name: () => expectedTokenInfo.name,
	symbol: () => expectedTokenInfo.symbol,
	decimals: () => expectedTokenInfo.decimals,
}

const mockPoolToken = {
	...mockToken,
	totalSupply: () => poolTokenInfo.supply
}
const testAsyncFunctions = async (token: Token | PoolToken) => {
	await expect(async () => token.fetchAllowance('0xSpender', '0xAccount'))
		.rejects
		.toThrow('Failed to fetch allowance: this._contract undefined')
	await expect(async () => token.fetchBalance('0xAccount'))
		.rejects
		.toThrow('Failed to fetch balance: this._contract undefined')
	await expect(async () => token.approve('0xAccount', 500))
		.rejects
		.toThrow('Failed to approve token: this._contract undefined')
}


describe('Testing token constructor', () => {
	// @ts-ignore
	ethers.Contract.mockImplementation(() => ({
		...mockToken
	}))

	it('No input', () => {
		return createToken().then((token) => (
			assertToken(token, expectedTokenInfo)
		))
	});
	it('Full input', async () => {
		return (
			createToken(false, expectedTokenInfo).then((token) => (
				assertToken(token, expectedTokenInfo)
			))
		)
	});

	it('Creating default', async () => {
		const token = Token.CreateDefault();
		assertToken(token, expectedDefault)
		testAsyncFunctions(token)
		expect(() => token.connect(null)).toThrow('Failed to connect Token: provider cannot be undefined')
	});
});

describe('Testing pool token constructor', () => {
	// @ts-ignore
	ethers.Contract.mockImplementation(() => ({
		...mockPoolToken
	}))

	it('No input', () => {
		return createToken(true).then((token) => {
			assertToken(token, expectedTokenInfo)
			assertPoolToken(token as PoolToken, expectedTokenInfo)
		})
	});
	it('Full input', async () => {
		return (
			createToken(true, expectedTokenInfo).then((token) => {
				assertToken(token, expectedTokenInfo)
				assertPoolToken(token as PoolToken, expectedTokenInfo)
			})
		)
	});
	it('Creating default', async () => {
		const poolToken = PoolToken.CreateDefault();
		assertToken(poolToken, expectedDefault)
		assertPoolToken(poolToken, expectedDefault)
		testAsyncFunctions(poolToken)
		expect(() => poolToken.connect(null)).toThrow('Failed to connect PoolToken: provider cannot be undefined')
	})
});