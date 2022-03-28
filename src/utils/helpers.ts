import { ethers } from "ethers";
import { CommitEnum } from "..";

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
