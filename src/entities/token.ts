import { ERC20__factory } from "@tracer-protocol/perpetual-pools-contracts/types";
import { ethers } from "ethers";
import { IContract } from "../types";

/**
 * Token class constructor inputs
 */
export interface IToken extends IContract, TokenInfo {}

/**
 * Token constructor props
 * Only `address` is required, additional props are encouraged
 * 	to reduce the number of RPC calls
 */
export interface TokenInfo {
	address: string;
	name?: string;
	symbol?: string;
	decimals?: number;
}

/**
 * Token class for interacting with ERC20 tokens
 * The constructor is private so must be instantiated with {@linkcode Token.Create}
 */
export default class Token {
	address: string;
	provider: ethers.providers.JsonRpcProvider;
	name: string;
	symbol: string;
	decimals: number;

	/**
	 * @private
	 */
	private constructor () {
		// these all need to be ovverridden in the init function
		this.address = '';
		this.provider = new ethers.providers.JsonRpcProvider('');
		this.name = '';
		this.symbol = '';
		this.decimals = 18;
	}

	/**
	 * Replacement constructor pattern to support async initialisations
	 * @param tokenINfo {@link IToken | IToken interface props}
	 * @returns a Promise containing an initialised Token class ready to be used
	 */
	public static Create: (tokenInfo: IToken) => Promise<Token> = async (tokenInfo) => {
		const token = new Token();
		// initialise the token;
		await token.init(tokenInfo);
		return token;
	}

	/**
	 * Private initialisation function called in {@link Token.Create}
	 * @private
	 * @param tokenInfo {@link IToken | IToken interface props}
	 */
	private init: (tokenInfo: IToken) => void = async (tokenInfo) => {
		this.provider = tokenInfo.provider;
		this.address = tokenInfo.address;

		const contract = ERC20__factory.connect(
			tokenInfo.address,
			tokenInfo.provider
		)

		const [name, symbol, decimals] = await Promise.all([
			tokenInfo?.name ? tokenInfo?.name : contract.name(),
			tokenInfo?.symbol ? tokenInfo?.symbol : contract.symbol(),
			tokenInfo?.decimals ? tokenInfo?.decimals : contract.decimals(),
		])

		this.name = name;
		this.symbol = symbol;
		this.decimals = decimals;
	}
}