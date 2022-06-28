export const NETWORKS = {
  ARBITRUM_RINKEBY: '421611',
  ARBITRUM: '42161',
  MAINNET: '1',
  RINKEBY: '4',
  KOVAN: '42'
} as const;

export const TCR_DECIMALS = 18;
export const TEST_TOKEN_DECIMALS = 18;
export const USDC_DECIMALS = 6;

export const TEST_QUOTE_TOKEN = {
    name: 'USDC',
    symbol: 'USDC',
    address: '0xa72276C7ecDc2D97b029F39Dd23fEf3Ea07D2ff8',
    decimals: TEST_TOKEN_DECIMALS,
}

export const SECONDS_PER_LEAP_YEAR = 31622400;

export const POOL_STATE_HELPER_BY_NETWORK = {
  [NETWORKS.ARBITRUM]: '',
  [NETWORKS.ARBITRUM_RINKEBY]: '0x71E9815c7ae3Ec9d29DBA58F85F291BeeA8Bbf96'
}