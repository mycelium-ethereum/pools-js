/**
 * Commit type enum
 * @enum
 */
export enum CommitEnum {
    shortMint = 0, // Mint short tokens
    shortBurn = 1, // Burn short tokens
    longMint = 2, // Mint long tokens
    longBurn = 3, // Burn long tokens
    longBurnShortMint = 4, // Burn Long tokens, then instantly mint in same upkeep
    shortBurnLongMint= 5 // Burn Short tokens, then instantly mint in same upkeep
}

/**
 * Simpler enum that just relates to the category of commit 
 * @enum
 */
export enum CommitActionEnum {
    mint = 0,
    burn = 1,
    flip = 2,
}

/**
 * Balance types since users can have some balance in escrow
 *  or use the balance from their wallet
 *  @enum
 */
export enum BalanceTypeEnum {
    wallet = 0,
    escrow = 1,
}

/**
 * @enum
 */
export enum SideEnum {
    long = 0,
    short = 1,
}

export enum KnownOracleType {
    // SMAOracle is an instance of ChainlinkOracleWrapper
    SMAOracle,
    // all oracles will conform to ChainlinkOracleWrapper
    ChainlinkOracleWrapper
}
