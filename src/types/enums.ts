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

// side types
export enum SideEnum {
    long = 0,
    short = 1,
}
