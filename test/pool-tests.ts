
const chai = require('chai')
const { use } = chai;

//use default BigNumber
use(require('chai-bignumber')());

import { assert } from 'console';
import { Committer } from '../src/entities/committer';
import { Pool } from '../src/entities/pool'
import { PoolToken } from '../src/entities/poolToken';
import { Token } from '../src/entities/token';

const ONE_HOUR = 3600; // seconds
const FIVE_MINUTES = 300; // seconds
const USDC_TOKEN_DECIMALS = 6;

const USDC = {
	name: 'USD Coin (Arb1)',
	symbol: 'USDC',
	decimals: 6,
	address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
}

const poolConfig = [
	{
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
		quoteToken: USDC
	},{
		name: '1-BTC/USDC',
		address: '0x146808f54DB24Be2902CA9f595AD8f27f56B2E76',
		leverage: 1,
		updateInterval: ONE_HOUR,
		frontRunningInterval: FIVE_MINUTES,
		keeper: '0x759E817F0C40B11C775d1071d466B5ff5c6ce28e',
		committer: {
			address: '0x539Bf88D729B65F8eC25896cFc7a5f44bbf1816b',
			minimumCommitSize: 1000
		},
		longToken: {
			name: '1L-BTC/USD',
			address: '0x1616bF7bbd60E57f961E83A602B6b9Abb6E6CAFc',
			symbol: '1L-BTC/USD',
			decimals: USDC_TOKEN_DECIMALS,
		},
		shortToken: {
			name: '1S-BTC/USD',
			address: '0x052814194f459aF30EdB6a506eABFc85a4D99501',
			symbol: '1S-BTC/USD',
			decimals: USDC_TOKEN_DECIMALS,
		},
		quoteToken: USDC
	},
	{
		name: '3-BTC/USDC',
		address: '0x70988060e1FD9bbD795CA097A09eA1539896Ff5D',
		leverage: 3,
		updateInterval: ONE_HOUR,
		frontRunningInterval: FIVE_MINUTES,
		keeper: '0x759E817F0C40B11C775d1071d466B5ff5c6ce28e',
		committer: {
			address: '0xFDE5D7B7596AF6aC5df7C56d76E14518A9F578dF',
			minimumCommitSize: 1000
		},
		longToken: {
			name: '3L-BTC/USD',
			address: '0x05A131B3Cd23Be0b4F7B274B3d237E73650e543d',
			symbol: '3L-BTC/USD',
			decimals: USDC_TOKEN_DECIMALS,
		},
		shortToken: {
			name: '3S-BTC/USD',
			address: '0x85700dC0bfD128DD0e7B9eD38496A60baC698fc8',
			symbol: '3S-BTC/USD',
			decimals: USDC_TOKEN_DECIMALS,
		},
		quoteToken: USDC
	},
	{
		name: '1-ETH/USDC',
		address: '0x3A52aD74006D927e3471746D4EAC73c9366974Ee',
		leverage: 1,
		updateInterval: ONE_HOUR,
		frontRunningInterval: FIVE_MINUTES,
		keeper: '0x759E817F0C40B11C775d1071d466B5ff5c6ce28e',
		committer: {
			address: '0x047Cd47925C2390ce26dDeB302b8b165d246d450',
			minimumCommitSize: 1000
		},
		longToken: {
			name: '1L-ETH/USD',
			address: '0x38c0a5443c7427e65A9Bf15AE746a28BB9a052cc',
			symbol: '1L-ETH/USD',
			decimals: USDC_TOKEN_DECIMALS,
		},
		shortToken: {
			name: '1S-ETH/USD',
			address: '0xf581571DBcCeD3A59AaaCbf90448E7B3E1704dcD',
			symbol: '1S-ETH/USD',
			decimals: USDC_TOKEN_DECIMALS,
		},
		quoteToken: USDC
	},
]
const createPool = async (address: string, config?: any) => (
	config	
		? Pool.Create({
			...config,
			address: address,
			rpcURL: 'https://arb1.arbitrum.io/rpc',
		})
		: Pool.Create({
			address: address,
			rpcURL: 'https://arb1.arbitrum.io/rpc'
		})
)


const assertPool: (pool: Pool, index: number) => void = (pool, index) => {
	assert(pool.keeper === poolConfig[index].keeper, "Pool keeper address does not match")
	assertCommitter(pool.committer, index);
	assertToken(pool.shortToken, 'shortToken', index)
	assertToken(pool.longToken, 'longToken', index)
	assertToken(pool.quoteToken, 'quoteToken', index)
}

const assertCommitter: (committer: Committer, index: number) => void = (committer, index) => {
	assert(committer.address === poolConfig[index].committer.address, "Committer address does not match")
	assert(committer.minimumCommitSize.toNumber() === poolConfig[index].committer.minimumCommitSize, "Committer minCommitSize does not match")
}

const assertToken: (token: Token | PoolToken, key: 'quoteToken' | 'shortToken' | 'longToken', index: number) => void = (token, key, index) => {
	assert(token.address === poolConfig[index][key].address,`${key} address does not match`) 
	assert(token.decimals === poolConfig[index][key].decimals, `${key} decimals do not match`)
	assert(token.symbol === poolConfig[index][key].symbol, `${key} symbol does not match`)
	assert(token.name === poolConfig[index][key].name, `${key} name does not match`)
}

describe('Testing pool constructor', function() {
	this.timeout(20000); 
	it('No input', function() {
		return Promise.all(poolConfig.map((pool, index) => (
			createPool(pool.address).then((pool) => {
				assertPool(pool, index)
			})
		)))
	});
	it('Full input', function() {
		return Promise.all(poolConfig.map((pool, index) => (
			createPool(pool.address, poolConfig[index]).then((pool) => {
				assertPool(pool, index)
			})
		)))
	});
});

describe('Calculating token prices', function() {
	this.timeout(10000)
	it('Long token', function() {
		const poolConfig_ = poolConfig[0];
		return (
			createPool(poolConfig_.address, poolConfig_).then((pool) => {
				console.log(pool.name)
				console.log('current long', pool.calcLongTokenPrice().toNumber())
				console.log('current short', pool.calcShortTokenPrice().toNumber())
				console.log('next long', pool.calcNextLongTokenPrice().toNumber())
				console.log('next short', pool.calcNextShortTokenPrice().toNumber())
			})
		)
	});
})