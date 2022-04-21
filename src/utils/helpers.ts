import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import { CommitEnum } from "..";
import { TotalPoolCommitments, TotalPoolCommitmentsBN } from "../types";

const NUM_PADDING_REQUIRED = 26;
export const encodeCommitParams: (
    payForClaim: boolean,
    fromAggregateBalances: boolean,
    commitType: CommitEnum,
    parsedAmount: ethers.BigNumber,
) => ethers.BytesLike = (payForClaim, fromAggregateBalances, commitType, parsedAmount) => {
    let expectedResult = ethers.utils.solidityPack(
        ['bool', 'bool', 'uint8', 'uint128'],
        [payForClaim, fromAggregateBalances, commitType, parsedAmount],
    );

    // Pad with 0s
    expectedResult = '0x' + '0'.repeat(NUM_PADDING_REQUIRED) + expectedResult.slice(2);

    return expectedResult;
};

export const ethersBNtoBN = (ethersBN: ethers.BigNumber): BigNumber => {
  return new BigNumber(ethersBN.toString());
};

export const movingAveragePriceTransformer = (lastPrice: BigNumber, currentPrice: BigNumber) => {
  return lastPrice.plus(currentPrice).div(2);
};

export const pendingCommitsToBN = (pendingCommits: TotalPoolCommitments): TotalPoolCommitmentsBN => {
    return {
      longBurnPoolTokens: ethersBNtoBN(pendingCommits.longBurnPoolTokens),
      longMintSettlement: ethersBNtoBN(pendingCommits.longMintSettlement),
      longBurnShortMintPoolTokens: ethersBNtoBN(pendingCommits.longBurnShortMintPoolTokens),
      shortBurnPoolTokens: ethersBNtoBN(pendingCommits.shortBurnPoolTokens),
      shortMintSettlement: ethersBNtoBN(pendingCommits.shortMintSettlement),
      shortBurnLongMintPoolTokens: ethersBNtoBN(pendingCommits.shortBurnLongMintPoolTokens),
      updateIntervalId: ethersBNtoBN(pendingCommits.updateIntervalId)
    };
  }

/**
 * attempt promise until it succeeds or the maximum number of allowed attempts is reached
 *
 * @returns a promise that will eventually error or resolve to the same type as the original promise
 */
export const attemptPromiseRecursively = async <T>({
    promise,
    retryCheck,
    maxAttempts = 3,
    interval = 1000,
    attemptCount = 1
  }: {
    promise: () => Promise<T>
    retryCheck?: (error: unknown) => Promise<boolean>
    maxAttempts?: number
    interval?: number
    attemptCount?: number
  }): Promise<T> => {
    try {
      const result = await promise();
      return result;
    } catch (error: unknown) {
      if (attemptCount >= maxAttempts) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, interval));

      if (!retryCheck || (retryCheck && await retryCheck(error))) {
        return attemptPromiseRecursively({ promise, retryCheck, interval, maxAttempts, attemptCount: attemptCount + 1 });
      } else {
        throw error;
      }
    }
  };
