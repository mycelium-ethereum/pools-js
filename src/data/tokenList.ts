import { StaticTokenInfo, KnownNetwork } from '../types';
import { NETWORKS } from '../utils';
const { ARBITRUM, ARBITRUM_RINKEBY, MAINNET, RINKEBY, KOVAN } = NETWORKS

const tokenList: Record<KnownNetwork, StaticTokenInfo[]> = {
    [ARBITRUM]: [
        {
            name: 'USDC',
            symbol: 'USDC',
            decimals: 6,
            address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
        },
        {
            name: 'Frax',
            symbol: 'FRAX',
            decimals: 18,
            address: '0x17fc002b466eec40dae837fc4be5c67993ddbd6f',
        },

    ],
    [ARBITRUM_RINKEBY]: [
        {
            name: 'USDC',
            symbol: 'USDC',
            decimals: 6,
            address: '0x1E77ad77925Ac0075CF61Fb76bA35D884985019d',
        },
    ],
    [MAINNET]: [
        {
            name: 'USDC',
            symbol: 'USDC',
            decimals: 6,
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        },
    ],
    [RINKEBY]: [
        {
            name: 'USDC',
            symbol: 'USDC',
            decimals: 6,
            address: '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b',
        },
    ],
    [KOVAN]: []
};

export const tokenMap: Record<KnownNetwork, Record<string, StaticTokenInfo>> = Object.assign(
    {},
    ...Object.keys(tokenList).map((key) => ({
        [key]: Object.assign(
            {},
            ...tokenList[key as KnownNetwork].map((token) => ({
                [token.symbol]: {
                    ...token,
                },
            })),
        ),
    })),
);
