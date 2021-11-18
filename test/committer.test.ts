jest.mock('ethers');

import { ethers } from 'ethers';
const { utils, BigNumber } = jest.requireActual('ethers');
ethers.utils = utils;
ethers.BigNumber = BigNumber;

import Committer from '../src/entities/committer';
import { CommitEnum } from '../src/types';

const QUOTE_TOKEN_DECIMALS = 6

const expected = {
	minimumCommitSize: 1000,
	pendingLong: {
		burn: 100,
		mint: 0
	},
	pendingShort: {
		burn: 0,
		mint: 100
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
	address: '0xCommitterAddress',
	minimumCommitSize: expected.minimumCommitSize,
	pendingLong: expected.pendingLong,
	pendingShort: expected.pendingShort
}

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
	expect(committer.address).toEqual(committerInfo.address);
	expect(committer.minimumCommitSize.toNumber()).toEqual(committerInfo.minimumCommitSize);
	expect(committer.pendingLong.burn.toNumber()).toEqual(committerInfo.pendingLong.burn);
	expect(committer.pendingLong.mint.toNumber()).toEqual(committerInfo.pendingLong.mint);
	expect(committer.pendingShort.burn.toNumber()).toEqual(committerInfo.pendingShort.burn);
	expect(committer.pendingShort.mint.toNumber()).toEqual(committerInfo.pendingShort.mint);
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