import { StaticTokenInfo, KnownNetwork } from '../types';
import { StaticPoolInfo } from '..';
import {
  NETWORKS,
  TEST_TOKEN_DECIMALS,
  TEST_QUOTE_TOKEN
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
            address: '0x18B825Ae49e069335C5de5e6060324aB109ff553',
            leverage: 1,
            updateInterval: FIVE_MINUTES,
            frontRunningInterval: THIRTY_SECONDS,
            keeper: '0xFBCbB7184935122Fdf2c7e8b69a3207Ece722749',
            committer: {
                address: '0xb07F47195803cACe6F890C7aD204000011f91175',
            },
            longToken: {
                name: '1-LONG-BTC/USD',
                address: '0x89A050D23646701a1996E712Ea503b54ded9E944',
                symbol: '1L-BTC/USD',
                decimals: TEST_QUOTE_TOKEN.decimals,
            },
            shortToken: {
                name: '1-SHORT-BTC/USD',
                address: '0xdB722cdF0b05572Ab59C6C3508d3979b2bCdE1dD',
                symbol: '1S-BTC/USD',
                decimals: TEST_QUOTE_TOKEN.decimals,
            },
            quoteToken: TEST_QUOTE_TOKEN
        },
        {
            // 3x
            name: '3-BTC/USDC',
            address: '0xEEb404ea14bb78d3742d4A6F3a23eA416AE541a4',
            leverage: 3,
            updateInterval: FIVE_MINUTES,
            frontRunningInterval: THIRTY_SECONDS,
            keeper: '0xFBCbB7184935122Fdf2c7e8b69a3207Ece722749',
            committer: {
                address: '0xF2116d4Eb7A3c8eCE59e935c7348A7d92819A4Bc',
            },
            longToken: {
                name: '3-LONG-BTC/USD',
                address: '0x06F7b0822d65AF1cd05C087D694f110d27cd5592',
                symbol: '3L-BTC/USD',
                decimals: TEST_QUOTE_TOKEN.decimals,
            },
            shortToken: {
                name: '3-SHORT-BTC/USD',
                address: '0x16468a5c4Ba94C050a2E88B16A68b95D3CA0be2F',
                symbol: '3S-BTC/USD',
                decimals: TEST_QUOTE_TOKEN.decimals,
            },
            quoteToken: TEST_QUOTE_TOKEN,
        },
        {
            // 1x
            name: '1-ETH/USDC',
            address: '0x6999d3f95b865cDE225a52d0157aA663CF2c78ef',
            leverage: 1,
            updateInterval: FIVE_MINUTES,
            frontRunningInterval: THIRTY_SECONDS,
            keeper: '0xFBCbB7184935122Fdf2c7e8b69a3207Ece722749',
            committer: {
                address: '0x9faE927FaF812450409Bc3259590d0D2F7add11C',
            },
            longToken: {
                name: '1-LONG-ETH/USD',
                address: '0xea7e9FdE89F6D8E07f83Fc722B64004A689fcBf6',
                symbol: '1L-ETH/USD',
                decimals: TEST_QUOTE_TOKEN.decimals,
            },
            shortToken: {
                name: '1-SHORT-ETH/USD',
                address: '0x5527FaA85146BE53cac459B61BA91a420705309c',
                symbol: '1S-ETH/USD',
                decimals: TEST_QUOTE_TOKEN.decimals,
            },
            quoteToken: TEST_QUOTE_TOKEN
        },
        {
            // 3x
            name: '3-ETH/USDC',
            address: '0x11F7FD07422dB02AceE8009C002146a3b0980D92',
            leverage: 3,
            updateInterval: FIVE_MINUTES,
            frontRunningInterval: THIRTY_SECONDS,
            keeper: '0xFBCbB7184935122Fdf2c7e8b69a3207Ece722749',
            committer: {
                address: '0x29EAAcB6FF4B883F1Ed630425cE89932601753E1',
            },
            longToken: {
                name: '3-LONG-ETH/USD',
                address: '0xbEF7d61956391E6ca75CEDe3AaE181b38e5f1308',
                symbol: '3L-ETH/USD',
                decimals: TEST_QUOTE_TOKEN.decimals,
            },
            shortToken: {
                name: '3-SHORT-ETH/USD',
                address: '0x8f58424f733037aCCBb22F9755cC34E9d7354d69',
                symbol: '3S-ETH/USD',
                decimals: TEST_QUOTE_TOKEN.decimals,
            },
            quoteToken: TEST_QUOTE_TOKEN,
        },
        {
            // 3x
            name: '3-ETH/USDC-SMA',
            address: '0xc76F8dd42D8f6f1dc3eeB1ee48ED950B7cb7544D',
            leverage: 3,
            updateInterval: FIVE_MINUTES,
            frontRunningInterval: THIRTY_SECONDS,
            keeper: '0xFBCbB7184935122Fdf2c7e8b69a3207Ece722749',
            committer: {
                address: '0x50eB7fb40803D358aCf317e09B086b94A0622235',
            },
            longToken: {
                name: '3-LONG-ETH/USD',
                address: '0x9b048056e8FA077f5902D70c16A096937bDD6c8E',
                symbol: '3L-ETH/USD',
                decimals: TEST_QUOTE_TOKEN.decimals,
            },
            shortToken: {
                name: '3-SHORT-ETH/USD',
                address: '0x3b7a33FA572c642beC932712298d1baA7C3615dB',
                symbol: '3S-ETH/USD',
                decimals: TEST_QUOTE_TOKEN.decimals,
            },
            quoteToken: TEST_QUOTE_TOKEN
        },
        {
            // 3x
            name: '3-ETH/USDC-SMA',
            address: '0xAA388c11f738a77945FB96d86Db8D6F7dCc5CCd7',
            leverage: 3,
            updateInterval: FIVE_MINUTES,
            frontRunningInterval: THIRTY_SECONDS,
            keeper: '0xFBCbB7184935122Fdf2c7e8b69a3207Ece722749',
            committer: {
                address: '0x96025f801eE19dfef560dbEf3122B254fD529550',
            },
            longToken: {
                name: '3-LONG-ETH/USD',
                address: '0xAD3Bf2833765482C20C638760035fF777adfC8c4',
                symbol: '3L-ETH/USD',
                decimals: TEST_QUOTE_TOKEN.decimals,
            },
            shortToken: {
                name: '3-SHORT-ETH/USD',
                address: '0xCdaB5Df545A3650faeD921E7202e0bc3f02e8EC7',
                symbol: '3S-ETH/USD',
                decimals: TEST_QUOTE_TOKEN.decimals,
            },
            quoteToken: TEST_QUOTE_TOKEN
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
