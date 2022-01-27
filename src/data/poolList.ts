import { StaticTokenInfo, KnownNetwork } from '../types';
import { StaticPoolInfo } from '..';
import {
  NETWORKS,
  TEST_TOKEN_DECIMALS
} from '../utils';
const { ARBITRUM, ARBITRUM_RINKEBY, MAINNET, RINKEBY, KOVAN } = NETWORKS
import { tokenMap } from './tokenList';

const ONE_HOUR=3600; // seconds
const FIVE_MINUTES=300; // seconds
const THIRTY_SECONDS=30; // seconds

export const poolList: Record<KnownNetwork, StaticPoolInfo[]> = {
    [ARBITRUM]: [
        {
            name: '1-BTC/USDC',
            address: '0x146808f54DB24Be2902CA9f595AD8f27f56B2E76',
            leverage: 1,
            updateInterval: ONE_HOUR,
            frontRunningInterval: FIVE_MINUTES,
            keeper: '0x759E817F0C40B11C775d1071d466B5ff5c6ce28e',
            committer: {
                address: '0x539Bf88D729B65F8eC25896cFc7a5f44bbf1816b',
            },
            longToken: {
                name: '1-LONG-BTC/USD',
                address: '0x1616bF7bbd60E57f961E83A602B6b9Abb6E6CAFc',
                symbol: '1L-BTC/USD',
                decimals: tokenMap[ARBITRUM].USDC.decimals,
            },
            shortToken: {
                name: '1-SHORT-BTC/USD',
                address: '0x052814194f459aF30EdB6a506eABFc85a4D99501',
                symbol: '1S-BTC/USD',
                decimals: tokenMap[ARBITRUM].USDC.decimals,
            },
            quoteToken: tokenMap[ARBITRUM].USDC,
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
            },
            longToken: {
                name: '3-LONG-BTC/USD',
                address: '0x05A131B3Cd23Be0b4F7B274B3d237E73650e543d',
                symbol: '3L-BTC/USD',
                decimals: tokenMap[ARBITRUM].USDC.decimals,
            },
            shortToken: {
                name: '3-SHORT-BTC/USD',
                address: '0x85700dC0bfD128DD0e7B9eD38496A60baC698fc8',
                symbol: '3S-BTC/USD',
                decimals: tokenMap[ARBITRUM].USDC.decimals,
            },
            quoteToken: tokenMap[ARBITRUM].USDC,
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
            },
            longToken: {
                name: '1-LONG-ETH/USD',
                address: '0x38c0a5443c7427e65A9Bf15AE746a28BB9a052cc',
                symbol: '1L-ETH/USD',
                decimals: tokenMap[ARBITRUM].USDC.decimals,
            },
            shortToken: {
                name: '1-SHORT-ETH/USD',
                address: '0xf581571DBcCeD3A59AaaCbf90448E7B3E1704dcD',
                symbol: '1S-ETH/USD',
                decimals: tokenMap[ARBITRUM].USDC.decimals,
            },
            quoteToken: tokenMap[ARBITRUM].USDC,
        },
        {
            name: '3-ETH/USDC',
            address: '0x54114e9e1eEf979070091186D7102805819e916B',
            leverage: 3,
            updateInterval: ONE_HOUR,
            frontRunningInterval: FIVE_MINUTES,
            keeper: '0x759E817F0C40B11C775d1071d466B5ff5c6ce28e',
            committer: {
                address: '0x72c4e7Aa6c743DA4e690Fa7FA66904BC3f2C9C04',
            },
            longToken: {
                name: '3-LONG-ETH/USD',
                address: '0xaA846004Dc01b532B63FEaa0b7A0cB0990f19ED9',
                symbol: '3L-ETH/USD',
                decimals: tokenMap[ARBITRUM].USDC.decimals,
            },
            shortToken: {
                name: '3-SHORT-ETH/USD',
                address: '0x7d7E4f49a29dDA8b1eCDcf8a8bc85EdcB234E997',
                symbol: '3S-ETH/USD',
                decimals: tokenMap[ARBITRUM].USDC.decimals,
            },
            quoteToken: tokenMap[ARBITRUM].USDC,
        },
        {
            name: '3-TOKE/USD',
            address: '0xc11B9Dc0F566B5084FC48Be1F821a8298fc900bC',
            leverage: 3,
            updateInterval: ONE_HOUR,
            frontRunningInterval: FIVE_MINUTES,
            keeper: '0x759E817F0C40B11C775d1071d466B5ff5c6ce28e',
            committer: {
                address: '0xb913D14B3a3bB1D06B2dB1Fd141f2432bB25F5F2',
            },
            longToken: {
                name: '3L-TOKE/USD',
                address: '0xCB78B42e374AB268B01336cE31C7ba329C1d4beC',
                symbol: '3L-TOKE/USD',
                decimals: tokenMap[ARBITRUM].USDC.decimals,
            },
            shortToken: {
                name: '3S-TOKE/USD',
                address: '0x16cd57B7Cf7c0954878C254b2318676007DF2af3',
                symbol: '3S-TOKE/USD',
                decimals: tokenMap[ARBITRUM].USDC.decimals,
            },
            quoteToken: tokenMap[ARBITRUM].USDC,
        },
        {
            name: '3-LINK/USD',
            address: '0x7b6FfAd58ce09f2a71c01e61F94b1592Bd641876',
            leverage: 3,
            updateInterval: ONE_HOUR,
            frontRunningInterval: FIVE_MINUTES,
            keeper: '0x759E817F0C40B11C775d1071d466B5ff5c6ce28e',
            committer: {
                address: '0x8186948382f67c7160Fc7b872688AdC293aDF789',
            },
            longToken: {
                name: '3L-LINK/USD',
                address: '0x9d6CCCb49Abd383C51079904e341cAb1d02d92c6',
                symbol: '3L-LINK/USD',
                decimals: tokenMap[ARBITRUM].USDC.decimals,
            },
            shortToken: {
                name: '3S-LINK/USD',
                address: '0x6d3bED2465d8c5e3Ef7F8DDC2CD3f8b38E90EaA5',
                symbol: '3S-LINK/USD',
                decimals: tokenMap[ARBITRUM].USDC.decimals,
            },
            quoteToken: tokenMap[ARBITRUM].USDC,
        },
        {
            name: '3-AAVE/USD',
            address: '0x23A5744eBC353944A4d5baaC177C16b199AfA4ed',
            leverage: 3,
            updateInterval: ONE_HOUR,
            frontRunningInterval: FIVE_MINUTES,
            keeper: '0x759E817F0C40B11C775d1071d466B5ff5c6ce28e',
            committer: {
                address: '0x993321599Fc9D0c5a496044308f16C70575DABBa',
            },
            longToken: {
                name: '3L-AAVE/USD',
                address: '0xd15239e444Ac687874fee8A415f8F59fd01E3E51',
                symbol: '3L-AAVE/USD',
                decimals: tokenMap[ARBITRUM].FRAX.decimals,
            },
            shortToken: {
                name: '3S-AAVE/USD',
                address: '0x4eBA8B7B13C565041D74b92dCA6C9E4B8885B3cC',
                symbol: '3S-AAVE/USD',
                decimals: tokenMap[ARBITRUM].FRAX.decimals,
            },
            quoteToken: tokenMap[ARBITRUM].FRAX,
        },
        {
            name: '1-EUR/USD',
            address: '0x2C740EEe739098Ab8E90f5Af78ac1d07835d225B',
            leverage: 1,
            updateInterval: ONE_HOUR,
            frontRunningInterval: FIVE_MINUTES,
            keeper: '0x759E817F0C40B11C775d1071d466B5ff5c6ce28e',
            committer: {
                address: '0xb894D3775862FFdE084eD31f9e42388e592E3137',
            },
            longToken: {
                name: '1L-EUR/USD',
                address: '0x6F680d315545309307F42840b234412090C0bBe8',
                symbol: '1L-EUR/USD',
                decimals: tokenMap[ARBITRUM].USDC.decimals,
            },
            shortToken: {
                name: '1S-EUR/USD',
                address: '0x7C5C24C5F3DbF4A99DDa5127D44e55b9a797eC4d',
                symbol: '1S-EUR/USD',
                decimals: tokenMap[ARBITRUM].USDC.decimals,
            },
            quoteToken: tokenMap[ARBITRUM].USDC,
        },
        {
            name: '3-EUR/USD',
            address: '0xA45B53547EC002403531D453c118AC41c03B3346',
            leverage: 3,
            updateInterval: ONE_HOUR,
            frontRunningInterval: FIVE_MINUTES,
            keeper: '0x759E817F0C40B11C775d1071d466B5ff5c6ce28e',
            committer: {
                address: '0x149BDeAC3E90522D8043452910Ef41f7cb75E3f3',
            },
            longToken: {
                name: '3L-EUR/USD',
                address: '0x316C96E328071DC6403587c243130712A9D03fF3',
                symbol: '3L-EUR/USD',
                decimals: tokenMap[ARBITRUM].USDC.decimals,
            },
            shortToken: {
                name: '3S-EUR/USD',
                address: '0xA8C483D29bFaD4Ea159C1a002f4769C33F808A1e',
                symbol: '3S-EUR/USD',
                decimals: tokenMap[ARBITRUM].USDC.decimals,
            },
            quoteToken: tokenMap[ARBITRUM].USDC,
        },
    ],
    [ARBITRUM_RINKEBY]: [
        {
            // 1x
            name: '1-BTC/USDC',
            address: '0x4eDc3814959705E59afeabbb52117950333c0721',
            leverage: 1,
            updateInterval: FIVE_MINUTES,
            frontRunningInterval: THIRTY_SECONDS,
            keeper: '0x6198BEc9C4163fFc80f3CCCF85Ab2229D4f9548c',
            committer: {
                address: '0xf28D52f5c2473DA310925Bc2A037B7A1b8461Afe',
            },
            longToken: {
                name: '1-LONG-BTC/USD',
                address: '0xd8E3eBEd3D1160A5efAEe776a821D45f2A6F6166',
                symbol: '1L-BTC/USD',
                decimals: TEST_TOKEN_DECIMALS,
            },
            shortToken: {
                name: '1-SHORT-BTC/USD',
                address: '0xBC43Fb6032a1477d0c6DB42d79dAd0d95517723D',
                symbol: '1S-BTC/USD',
                decimals: TEST_TOKEN_DECIMALS,
            },
            quoteToken: {
                name: 'USDC',
                symbol: 'USDC',
                address: '0x8F5256FeA71ee6EFc2F8175De7E5d0A3bbC0912e',
                decimals: TEST_TOKEN_DECIMALS,
            },
        },
        {
            // 3x
            name: '3-BTC/USDC',
            address: '0xffdf8772009f5DCE84a59b5068E6AdE7a1714A84',
            leverage: 3,
            updateInterval: FIVE_MINUTES,
            frontRunningInterval: THIRTY_SECONDS,
            keeper: '0x6198BEc9C4163fFc80f3CCCF85Ab2229D4f9548c',
            committer: {
                address: '0x1aC2b2bF18EC6C324c80Aa084ECDa88E4a9faCcF',
            },
            longToken: {
                name: '3-LONG-BTC/USD',
                address: '0x4B9003eca9220FFBC555894139FfC24E987fB72A',
                symbol: '3L-BTC/USD',
                decimals: TEST_TOKEN_DECIMALS,
            },
            shortToken: {
                name: '3-SHORT-BTC/USD',
                address: '0xF61E60479f990911dbeD284E2c60bB475b010247',
                symbol: '3S-BTC/USD',
                decimals: TEST_TOKEN_DECIMALS,
            },
            quoteToken: {
                name: 'USDC',
                symbol: 'USDC',
                address: '0x8F5256FeA71ee6EFc2F8175De7E5d0A3bbC0912e',
                decimals: TEST_TOKEN_DECIMALS,
            },
        },
        {
            // 1x
            name: '1-ETH/USDC',
            address: '0x38C743610374e33b73c19f4818a3cC6E1bd471e2',
            leverage: 1,
            updateInterval: FIVE_MINUTES,
            frontRunningInterval: THIRTY_SECONDS,
            keeper: '0x6198BEc9C4163fFc80f3CCCF85Ab2229D4f9548c',
            committer: {
                address: '0x5E67A1491504D3fC10Ae8c9B856b0dDD4336925b',
            },
            longToken: {
                name: '1-LONG-ETH/USD',
                address: '0x47793609f0A6Af93bbac5b23626BEe9862B2e26C',
                symbol: '1L-ETH/USD',
                decimals: TEST_TOKEN_DECIMALS,
            },
            shortToken: {
                name: '1-SHORT-ETH/USD',
                address: '0x857B0D89F87370297C920282c58444df9dB021D2',
                symbol: '1S-ETH/USD',
                decimals: TEST_TOKEN_DECIMALS,
            },
            quoteToken: {
                name: 'USDC',
                symbol: 'USDC',
                address: '0x8F5256FeA71ee6EFc2F8175De7E5d0A3bbC0912e',
                decimals: TEST_TOKEN_DECIMALS,
            },
        },
        {
            // 3x
            name: '3-ETH/USDC',
            address: '0x127C731292F36f9aE9a8fEB943A93C9e2B7da510',
            leverage: 3,
            updateInterval: FIVE_MINUTES,
            frontRunningInterval: THIRTY_SECONDS,
            keeper: '0x6198BEc9C4163fFc80f3CCCF85Ab2229D4f9548c',
            committer: {
                address: '0x96025f801eE19dfef560dbEf3122B254fD529550',
            },
            longToken: {
                name: '3-LONG-ETH/USD',
                address: '0x5eb1C0A5f504C4A9918C3Ac4B792c50A1f7baDD6',
                symbol: '3L-ETH/USD',
                decimals: TEST_TOKEN_DECIMALS,
            },
            shortToken: {
                name: '3-SHORT-ETH/USD',
                address: '0x71387BF06CAB231A7487EF9D0B1F518a5720b2Ef',
                symbol: '3S-ETH/USD',
                decimals: TEST_TOKEN_DECIMALS,
            },
            quoteToken: {
                name: 'USDC',
                symbol: 'USDC',
                address: '0x8F5256FeA71ee6EFc2F8175De7E5d0A3bbC0912e',
                decimals: TEST_TOKEN_DECIMALS,
            },
        },
        {
            // 3x
            name: '3-ETH/USDC-SMA',
            address: '0xAA388c11f738a77945FB96d86Db8D6F7dCc5CCd7',
            leverage: 3,
            updateInterval: FIVE_MINUTES,
            frontRunningInterval: THIRTY_SECONDS,
            keeper: '0x6198BEc9C4163fFc80f3CCCF85Ab2229D4f9548c',
            committer: {
                address: '0x96025f801eE19dfef560dbEf3122B254fD529550',
            },
            longToken: {
                name: '3-LONG-ETH/USD',
                address: '0xAD3Bf2833765482C20C638760035fF777adfC8c4',
                symbol: '3L-ETH/USD',
                decimals: TEST_TOKEN_DECIMALS,
            },
            shortToken: {
                name: '3-SHORT-ETH/USD',
                address: '0xCdaB5Df545A3650faeD921E7202e0bc3f02e8EC7',
                symbol: '3S-ETH/USD',
                decimals: TEST_TOKEN_DECIMALS,
            },
            quoteToken: {
                name: 'USDC',
                symbol: 'USDC',
                address: '0x8F5256FeA71ee6EFc2F8175De7E5d0A3bbC0912e',
                decimals: TEST_TOKEN_DECIMALS,
            },
        },
    ],
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
