import { TypedEmitter } from 'tiny-typed-emitter';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { ethersBNtoBN } from '../utils';

// TODO: update to latest version after redeploy/abis are provided via sdk or other package
import {
  LeveragedPool,
  LeveragedPool__factory,
  PoolCommitter__factory,
  PoolKeeper__factory,
  PoolSwapLibrary,
  PoolSwapLibrary__factory
} from '@tracer-protocol/perpetual-pools-contracts/types';

import {
  attemptPromiseRecursively,
  movingAveragePriceTransformer
} from '../utils';

import { Pool } from '../entities'

import {
  PoolWatcherConstructorArgs,
  WatchedPool,
  RawCommitType,
  PoolWatcherEvents,
} from '../types';

import {
  EVENT_NAMES,
  POOL_STATE_HELPER_BY_NETWORK
} from '../utils/constants';

export default class PoolWatcher extends TypedEmitter<PoolWatcherEvents> {
  provider: ethers.providers.BaseProvider
  watchedPool: WatchedPool
  poolInstance: LeveragedPool
  poolSwapLibrary: PoolSwapLibrary
  poolAddress: string
  chainId: string
  commitmentWindowBuffer: number
  isWatching: boolean
  oraclePriceTransformer: (lastPrice: BigNumber, currentPrice: BigNumber) => BigNumber
  ignoreEvents: { [eventName: string]: boolean }

  constructor (args: PoolWatcherConstructorArgs) {
    super();

    if (!POOL_STATE_HELPER_BY_NETWORK[args.chainId]) {
      const supportedNetworks = Object.keys(POOL_STATE_HELPER_BY_NETWORK);
      throw new Error(`unsupported chainId: ${args.chainId}, supported values are [${supportedNetworks.join(', ')}]`);
    }

    this.provider = ethers.getDefaultProvider(args.nodeUrl);
    this.poolInstance = LeveragedPool__factory.connect(args.poolAddress, this.provider);
    this.poolSwapLibrary = PoolSwapLibrary__factory.connect(POOL_STATE_HELPER_BY_NETWORK[args.chainId], this.provider);
    this.poolAddress = args.poolAddress;
    this.chainId = args.chainId;
    this.watchedPool = {} as WatchedPool;
    this.commitmentWindowBuffer = args.commitmentWindowBuffer;
    this.isWatching = false;
    this.oraclePriceTransformer = args.oraclePriceTransformer || movingAveragePriceTransformer;
    this.ignoreEvents = args.ignoreEvents || {};
  }

  // fetches details about pool to watch and
  // initialises smart contract instances of other perpetual pools components (keeper, committer, tokens)
  async initializeWatchedPool () {

    const [
      lastPriceTimestamp,
      sdkInstance
    ] = await Promise.all([
      attemptPromiseRecursively({ promise: () => this.poolInstance.lastPriceTimestamp() }),
      attemptPromiseRecursively({ promise: () => Pool.Create({
        address: this.poolAddress,
        provider: this.provider as ethers.providers.JsonRpcProvider,
    }) }),
    ]);

    this.watchedPool = {
      address: this.poolAddress,
      sdkInstance,
      // do not re-use keeper and committer instances from SDK since this class registers event listeners on them
      // and event listeners don't work properly on contracts connected to multicall providers
      committerInstance: PoolCommitter__factory.connect(sdkInstance.committer.address, this.provider),
      keeperInstance: PoolKeeper__factory.connect(sdkInstance.keeper, this.provider),
      updateInterval: sdkInstance.updateInterval.toNumber(),
      frontRunningInterval: sdkInstance.frontRunningInterval.toNumber(),
      lastPriceTimestamp: lastPriceTimestamp.toNumber()
    };
  }

  async isCommitmentWindowStillOpen (updateIntervalId: number) {
    if (!this.watchedPool.address) {
      throw new Error('isCommitmentWindowStillOpen: watched pool not initialised');
    }

    const appropriateUpdateIntervalId = await attemptPromiseRecursively({
      promise: () => this.watchedPool.committerInstance.getAppropriateUpdateIntervalId()
    });

    return appropriateUpdateIntervalId.eq(updateIntervalId);
  }

  async startWatchingPool () {
    if (this.isWatching) {
      throw new Error('startWatchingPool: already watching');
    }

    this.isWatching = true;

    if (!this.watchedPool.address) {
      throw new Error('startWatchingPool: watched pool not initialised');
    }

    const upkeepSuccessfulFilter = this.watchedPool.keeperInstance.filters.UpkeepSuccessful(this.poolAddress);

    if (!this.ignoreEvents[EVENT_NAMES.COMMITMENT_WINDOW_ENDING] || !this.ignoreEvents[EVENT_NAMES.COMMITMENT_WINDOW_ENDED]) {
      const [emitWindowEnding, emitWindowEnded] = [!this.ignoreEvents[EVENT_NAMES.COMMITMENT_WINDOW_ENDING], !this.ignoreEvents[EVENT_NAMES.COMMITMENT_WINDOW_ENDED]];
      const scheduleStateCalculation = async () => {
        const [
          lastPriceTimestampEthersBN,
          appropriateIntervalIdBefore
        ] = await Promise.all([
          attemptPromiseRecursively({ promise: () => this.poolInstance.lastPriceTimestamp() }),
          attemptPromiseRecursively({ promise: () => this.watchedPool.committerInstance.getAppropriateUpdateIntervalId() })
        ]);

        const { frontRunningInterval, updateInterval } = this.watchedPool as WatchedPool;

        const lastPriceTimestamp = lastPriceTimestampEthersBN.toNumber();
        const commitmentWindowEnd = frontRunningInterval < updateInterval
        // simple case
          ? lastPriceTimestamp + updateInterval - frontRunningInterval
        // complex case, multiple update intervals within frontRunningInterval
          : lastPriceTimestamp + updateInterval;

        // calculate the time at which we should wait until to calculate expected pool state
        const waitUntil = commitmentWindowEnd - this.commitmentWindowBuffer;

        const nowSeconds = Math.floor(Date.now() / 1000);

        // if we are already past the start of the acceptable commitment window end
        // do nothing and wait until next upkeep to schedule anything
        if (nowSeconds > waitUntil) {
          if (emitWindowEnded) {
            if (nowSeconds > commitmentWindowEnd) {
              // if we are already ended
              this.emit(EVENT_NAMES.COMMITMENT_WINDOW_ENDED);
            } else {
              // time is between buffer and commitmentWindowEnd
              setTimeout(() => {
                this.emit(EVENT_NAMES.COMMITMENT_WINDOW_ENDED);
              }, (nowSeconds - commitmentWindowEnd) * 1000);
            }
          }
          this.watchedPool.keeperInstance.once(upkeepSuccessfulFilter, () => {
            scheduleStateCalculation();
          });
        } else {
        // set time out for waitUntil - nowSeconds
        // wake up and check if we are still inside of the same commitment window
          setTimeout(async () => {
            if (emitWindowEnded) {
              // wait the buffer time and fire an ended event
              setTimeout(() => {
                this.emit(EVENT_NAMES.COMMITMENT_WINDOW_ENDED);
              }, this.commitmentWindowBuffer * 1000);
            }

            if (emitWindowEnding) {
              const windowIsOpenBeforeStateCalc = await this.isCommitmentWindowStillOpen(
                appropriateIntervalIdBefore.toNumber()
              );

              // if the appropriate update interval id is still the same as before we slept,
              // we are still within the acceptable commitment window
              if (windowIsOpenBeforeStateCalc) {
                const expectedState = await this.watchedPool.sdkInstance.getExpectedPoolState('frontRunningInterval');

                // do one last check to make sure commitment window has not ended
                const windowIsOpenAfterStateCalc = await attemptPromiseRecursively({
                  promise: () => this.watchedPool.committerInstance.getAppropriateUpdateIntervalId()
                });

                if (windowIsOpenAfterStateCalc) {
                  this.emit(EVENT_NAMES.COMMITMENT_WINDOW_ENDING, {
                    ...expectedState,
                    updateIntervalId: ethersBNtoBN(appropriateIntervalIdBefore)
                  });
                }
              }
            }

            this.watchedPool.keeperInstance.once(upkeepSuccessfulFilter, () => {
              scheduleStateCalculation();
            });
          }, (waitUntil - nowSeconds) * 1000);
        }
      };

      scheduleStateCalculation();
    }

    if (!this.ignoreEvents[EVENT_NAMES.COMMIT]) {
      const createCommitFilter = this.watchedPool.committerInstance.filters.CreateCommit();

      this.watchedPool.committerInstance.on(createCommitFilter, async (
        user,
        amount,
        commitType,
        appropriateIntervalId,
        fromAggregateBalance,
        payForClaim,
        mintingFee,
        event
      ) => {
        const block = await event.getBlock();

        this.emit(EVENT_NAMES.COMMIT, {
          user,
          amount: ethersBNtoBN(amount),
          commitType: commitType as RawCommitType,
          appropriateIntervalId: appropriateIntervalId.toNumber(),
          fromAggregateBalance,
          payForClaim,
          mintingFee,
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: block.timestamp,
          settlementTokenDecimals: this.watchedPool.sdkInstance.settlementToken.decimals
        });
      });
    }

    if (!this.ignoreEvents[EVENT_NAMES.UPKEEP]) {
      this.watchedPool.keeperInstance.on(upkeepSuccessfulFilter, async (
        poolAddress,
        data,
        startPrice,
        endPrice,
        event
      ) => {
        const block = await event.getBlock();

        this.emit(EVENT_NAMES.UPKEEP, {
          poolAddress,
          data,
          startPrice: ethersBNtoBN(startPrice),
          endPrice: ethersBNtoBN(endPrice),
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: block.timestamp
        });
      });
    }

    if (!this.ignoreEvents[EVENT_NAMES.COMMITS_EXECUTED]) {
      const commitsExecutedFilter = this.watchedPool.committerInstance.filters.ExecutedCommitsForInterval();

      this.watchedPool.committerInstance.on(commitsExecutedFilter, async (
        updateIntervalId,
        burningFee,
        event
      ) => {
        const block = await event.getBlock();

        this.emit(EVENT_NAMES.COMMITS_EXECUTED, {
          updateIntervalId: updateIntervalId.toNumber(),
          burningFee,
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: block.timestamp
        });
      });
    }
  }
}
