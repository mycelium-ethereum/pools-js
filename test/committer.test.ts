jest.mock('ethers');

import { ethers } from 'ethers';
const { utils, BigNumber } = jest.requireActual('ethers');
ethers.utils = utils;
ethers.BigNumber = BigNumber;

import Committer from '../src/entities/committer';
import { CommitEnum } from '../src/types';
import { BigNumber as BigNumberJS } from 'bignumber.js';

const QUOTE_TOKEN_DECIMALS = 6

const expected = {
	address: '0xCommitterAddress',
	minimumCommitSize: new BigNumberJS(1000),
	pendingLong: {
		burn: new BigNumberJS(100),
		mint: new BigNumberJS(0)
	},
	pendingShort: {
		mint: new BigNumberJS(100),
		burn: new BigNumberJS(0)
	},
}
interface CommitterInfo {
	address: string;
	minimumCommitSize: number;
	pendingLong: {
		burn: number,
		mint: number,
	};
	pendingShort: {
		burn: number,
		mint: number,
	};
}

const committerInfo: CommitterInfo = {
	address: expected.address,
	minimumCommitSize: expected.minimumCommitSize.toNumber(),
	pendingLong: {
		mint: expected.pendingLong.mint.toNumber(),
		burn: expected.pendingLong.burn.toNumber(),
	},
	pendingShort: {
		mint: expected.pendingShort.mint.toNumber(),
		burn: expected.pendingShort.burn.toNumber()
	}
}

const ZERO = new BigNumberJS(0);

const provider = new ethers.providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');

const createCommitter: (config?: CommitterInfo) => Promise<Committer> = async (config) => {
	return (
		config	
			? Committer.Create({
				...config,
				address: committerInfo.address,
				provider: provider,
				quoteTokenDecimals: QUOTE_TOKEN_DECIMALS
			})
			: Committer.Create({
				address: committerInfo.address,
				provider: provider,
				quoteTokenDecimals: QUOTE_TOKEN_DECIMALS
			})
	)
}


const assertCommitter: (committer: Committer) => void = (committer) => {
	expect(committer.address).toEqual(expected.address);
	expect(committer.minimumCommitSize).toEqual(expected.minimumCommitSize);
	expect(committer.pendingLong.burn).toEqual(expected.pendingLong.burn);
	expect(committer.pendingLong.mint).toEqual(expected.pendingLong.mint);
	expect(committer.pendingShort.burn).toEqual(expected.pendingShort.burn);
	expect(committer.pendingShort.mint).toEqual(expected.pendingShort.mint);
}

const mockCommitter = {
	// committer functions
	minimumCommitSize: () => committerInfo.minimumCommitSize,
	shadowPools: (num: CommitEnum) => {
		switch (num) {
			case CommitEnum.longBurn:
				return Promise.resolve(ethers.utils.parseUnits(expected.pendingLong.burn.toString(), QUOTE_TOKEN_DECIMALS))
			case CommitEnum.longMint:
				return Promise.resolve(ethers.utils.parseUnits(expected.pendingLong.mint.toString(), QUOTE_TOKEN_DECIMALS))
			case CommitEnum.shortBurn:
				return Promise.resolve(ethers.utils.parseUnits(expected.pendingShort.burn.toString(), QUOTE_TOKEN_DECIMALS))
			case CommitEnum.shortMint:
				return Promise.resolve(ethers.utils.parseUnits(expected.pendingShort.mint.toString(), QUOTE_TOKEN_DECIMALS))
			default:
				return 0
		}
	}
}

describe('Testing committer constructor', () => {
	// @ts-ignore
	ethers.Contract.mockImplementation(() => ({
		...mockCommitter
	}))

	it('No input', () => {
		return createCommitter().then((committer) => (
			assertCommitter(committer)
		))
	});
	it('Full input', async () => {
		return (
			createCommitter(committerInfo).then((committer) => (
				assertCommitter(committer)
			))
		)
	});
	it('Creating default', () => {
		const committer = Committer.CreateDefault();
		expect(committer.address).toEqual('');
		expect(committer.pendingLong.burn).toEqual(ZERO);
		expect(committer.pendingLong.mint).toEqual(ZERO);
		expect(committer.pendingShort.burn).toEqual(ZERO);
		expect(committer.pendingShort.mint).toEqual(ZERO);
		expect(committer.quoteTokenDecimals).toEqual(18);
		expect(committer.minimumCommitSize).toEqual(ZERO);
		expect(() => committer.connect(null)).toThrow('Failed to connect Committer: provider cannot be undefined')
	});
});

describe('Testing commit' ,() => {
	it('_contract is undefined', async () => {
		const committer = await createCommitter()
		committer._contract = undefined;
		expect(() => committer.commit(CommitEnum.longBurn, 1000)).toThrow("Failed to commit: this._contract undefined")
	})
	it('signer is undefined', async () => {
		const committer = await createCommitter()
		const mock = jest.fn().mockReturnValue(undefined)
		committer.provider.getSigner = mock;
		expect(() => committer.commit(CommitEnum.longBurn, 1000)).toThrow("Failed to commit: provider.getSigner is undefined")
		expect(mock.mock.calls.length).toBe(1);
	})
})

describe('Testing fetchShadowPool', () => {
	// @ts-ignore
	ethers.Contract.mockImplementation(() => ({
		...mockCommitter
	}))
	it('_contract is undefined', async () => {
		const committer = await createCommitter()
		committer._contract = undefined;
		await expect(async () => await committer.fetchShadowPool(CommitEnum.longBurn))
			.rejects
			.toThrow("Failed to update pending amount: this._contract undefined")
		await expect(async () => await committer.fetchAllShadowPools())
			.rejects
			.toThrow("Failed to update pending amounts: this._contract undefined")
	})
	it('Successfuly fetch and set', async () => {
		const committer = await createCommitter()
		const pendingLongBurn = await committer.fetchShadowPool(CommitEnum.longBurn);
		expect(pendingLongBurn).toEqual(expected.pendingLong.burn)
		expect(committer.pendingLong.burn).toEqual(expected.pendingLong.burn)
		const pendingLongMint = await committer.fetchShadowPool(CommitEnum.longMint);
		expect(pendingLongMint).toEqual(expected.pendingLong.mint)
		expect(committer.pendingLong.mint).toEqual(expected.pendingLong.mint)
		const pendingShortBurn = await committer.fetchShadowPool(CommitEnum.shortBurn);
		expect(pendingShortBurn).toEqual(expected.pendingShort.burn)
		expect(committer.pendingShort.burn).toEqual(expected.pendingShort.burn)
		const pendingShortMint = await committer.fetchShadowPool(CommitEnum.shortMint);
		expect(pendingShortMint).toEqual(expected.pendingShort.mint)
		expect(committer.pendingShort.mint).toEqual(expected.pendingShort.mint)
	})
	it('Successfuly fetch and set', async () => {
		const committer = await createCommitter()
		const { pendingLong, pendingShort } = await committer.fetchAllShadowPools();
		expect(pendingLong.burn).toEqual(expected.pendingLong.burn)
		expect(committer.pendingLong.burn).toEqual(expected.pendingLong.burn)
		expect(pendingLong.mint).toEqual(expected.pendingLong.mint)
		expect(committer.pendingLong.mint).toEqual(expected.pendingLong.mint)
		expect(pendingShort.burn).toEqual(expected.pendingShort.burn)
		expect(committer.pendingShort.burn).toEqual(expected.pendingShort.burn)
		expect(pendingShort.mint).toEqual(expected.pendingShort.mint)
		expect(committer.pendingShort.mint).toEqual(expected.pendingShort.mint)
	})
})