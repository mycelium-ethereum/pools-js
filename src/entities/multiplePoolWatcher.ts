import { TypedEmitter } from 'tiny-typed-emitter';

import {
  MultiplePoolWatcherConstructorArgs,
  MultiplePoolWatcherEvents
} from '../types';
import { PoolWatcher } from '../entities';
import { EVENT_NAMES } from '../utils/constants';

export default class MultiplePoolWatcher extends TypedEmitter<MultiplePoolWatcherEvents> {
  nodeUrl: string;
  poolAddresses: string[]
  chainId: string
  commitmentWindowBuffer: number
  ignoreEvents: { [eventName: string]: boolean } | undefined

  constructor (args: MultiplePoolWatcherConstructorArgs) {
    super();
    this.nodeUrl = args.nodeUrl;
    this.poolAddresses = args.poolAddresses;
    this.chainId = args.chainId;
    this.commitmentWindowBuffer = args.commitmentWindowBuffer;
    this.ignoreEvents = args.ignoreEvents;
  }

  async initializePoolWatchers () {
    return Promise.all(this.poolAddresses.map(async (poolAddress) => {
      const poolWatcher = new PoolWatcher({
        nodeUrl: this.nodeUrl,
        commitmentWindowBuffer: this.commitmentWindowBuffer, // calculate pool state 10 seconds before
        chainId: this.chainId,
        poolAddress,
        ignoreEvents: this.ignoreEvents
      });

      await poolWatcher.initializeWatchedPool();
      poolWatcher.startWatchingPool();

      poolWatcher.on(EVENT_NAMES.COMMITMENT_WINDOW_ENDING, state => {
        this.emit(EVENT_NAMES.COMMITMENT_WINDOW_ENDING, { ...state, poolAddress }); // forwards event
      });

      poolWatcher.on(EVENT_NAMES.COMMITMENT_WINDOW_ENDED, () => {
        this.emit(EVENT_NAMES.COMMITMENT_WINDOW_ENDED, { poolAddress }); // forwards event
      });

      poolWatcher.on(EVENT_NAMES.COMMIT, commitData => {
        this.emit(EVENT_NAMES.COMMIT, { ...commitData, poolAddress }); // forwards event
      });

      poolWatcher.on(EVENT_NAMES.UPKEEP, data => {
        this.emit(EVENT_NAMES.UPKEEP, { ...data, poolAddress }); // forwards event
      });

      poolWatcher.on(EVENT_NAMES.COMMITS_EXECUTED, data => {
        this.emit(EVENT_NAMES.COMMITS_EXECUTED, { ...data, poolAddress }); // forwards event
      });
    }));
  }
}
