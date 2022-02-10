import { StaticTokenInfo, KnownNetwork } from '../types';
import { StaticPoolInfo } from '..';
import * as arbitrumPoolList from "./static/arbitrum.json";
import * as arbitrumRinkebyPoolList from "./static/arb-rinkeby.json";
import {
  NETWORKS,
} from '../utils';
const { ARBITRUM, ARBITRUM_RINKEBY, MAINNET, RINKEBY, KOVAN } = NETWORKS

export const poolList: Record<KnownNetwork, StaticPoolInfo[]> = {
    [ARBITRUM]: arbitrumPoolList.pools,
    [ARBITRUM_RINKEBY]: arbitrumRinkebyPoolList.pools,
    [MAINNET]: [],
    [RINKEBY]: [],
    [KOVAN]: [],
};

// construct pool map so it is easier to access specific pools
export const poolMap: Record<KnownNetwork, Record<string, StaticPoolInfo>> = Object.assign(
    {},
    ...Object.keys(poolList).map((key) => ({
        [key]: Object.assign(
            {},
            ...poolList[key as KnownNetwork].map((poolInfo) => ({
                [poolInfo.address]: {
                    ...poolInfo,
                },
            })),
        ),
    })),
);

// construct token list from the assets listed within the poolsList
export const poolTokenList: Record<KnownNetwork, Record<string, StaticTokenInfo>> = Object.assign(
    {},
    ...Object.keys(poolList).map((key) => ({
        [key]: Object.assign(
            {},
            ...poolList[key as KnownNetwork].map((poolInfo) => ({
                ...(poolInfo.shortToken ? {
                    [poolInfo.shortToken.address]: {
                        ...(poolInfo.shortToken || {}),
                    },
                } : {}),
                ...(poolInfo.longToken ? {
                    [poolInfo.longToken.address]: {
                        ...(poolInfo.longToken || {}),
                    },
                } : {}),
            })),
        ),
    })),
);
