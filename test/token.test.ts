const chai = require('chai')
const { use } = chai;

//use default BigNumber
use(require('chai-bignumber')());

jest.mock('ethers');

import { ethers } from 'ethers';
const { utils } = jest.requireActual('ethers');
ethers.utils = utils;

import PoolToken from '../src/entities/poolToken';
import Token from '../src/entities/token';
import { StaticTokenInfo } from '../src/types';

const expected = {
	tokenSupply: 1000
}

const tokenInfo: StaticTokenInfo = {
	address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
	name: 'Test Token',
	symbol: 'TEST',
	decimals: 18
}

const poolTokenInfo = {
	...tokenInfo,
	supply: ethers.utils.parseEther(expected.tokenSupply.toString()),
	pool: '0xPoolAddress'
}


const provider = new ethers.providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');

const createToken: (poolToken?: boolean, config?: StaticTokenInfo) => Promise<PoolToken | Token> = async (poolToken, config) => {
	if (poolToken) {
		return (
			config	
				? PoolToken.Create({
					...config,
					address: tokenInfo.address,
					provider: provider,
					pool: poolTokenInfo?.pool
				})
				: PoolToken.Create({
					address: tokenInfo.address,
					provider: provider,
					pool: poolTokenInfo?.pool
				})
		)
	} else {
		return (
			config	
				? Token.Create({
					...config,
					address: tokenInfo.address,
					provider: provider,
				})
				: Token.Create({
					address: tokenInfo.address,
					provider: provider,
				})
		)

	}
}


const assertToken: (token: Token | PoolToken) => void = (token) => {
	expect(token.name).toEqual(tokenInfo.name)
	expect(token.address).toEqual(tokenInfo.address)
	expect(token.symbol).toEqual(tokenInfo.symbol)
	expect(token.decimals).toEqual(tokenInfo.decimals)
}

const assertPoolToken: (token: PoolToken) => void = (token) => {
	expect(token.supply.toNumber()).toEqual(expected.tokenSupply)
	expect(token.pool).toEqual(poolTokenInfo.pool)
}

const mockToken = {
	// token functions
	name: () => tokenInfo.name,
	symbol: () => tokenInfo.symbol,
	decimals: () => tokenInfo.decimals,
}

const mockPoolToken = {
	...mockToken,
	totalSupply: () => poolTokenInfo.supply
}


describe('Testing token constructor', () => {
	// @ts-ignore
	ethers.Contract.mockImplementation(() => ({
		...mockToken
	}))

	it('No input', () => {
		return createToken().then((token) => (
			assertToken(token)
		))
	});
	it('Full input', async () => {
		return (
			createToken(false, tokenInfo).then((token) => (
				assertToken(token)
			))
		)
	});
});

describe('Testing pool token constructor', () => {
	// @ts-ignore
	ethers.Contract.mockImplementation(() => ({
		...mockPoolToken
	}))

	it('No input', () => {
		return createToken(true).then((token) => {
			assertToken(token)
			assertPoolToken(token as PoolToken)
		})
	});
	it('Full input', async () => {
		return (
			createToken(true, tokenInfo).then((token) => {
				assertToken(token)
				assertPoolToken(token as PoolToken)
			})
		)
	});
});