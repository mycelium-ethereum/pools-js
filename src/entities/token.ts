import { ERC20, ERC20__factory } from "@tracer-protocol/perpetual-pools-contracts/types";
import BigNumber from "bignumber.js"
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
	_contract?: ERC20;
	address: string;
	provider: ethers.providers.Provider | ethers.Signer | undefined;
	name: string;
	symbol: string;
	decimals: number;

	/**
	 * @private
	 */
	private constructor () {
		// these all need to be ovverridden in the init function
		this.address = '';
		this.provider = undefined;
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
	 * Creates an empty Token that can be used as a default
	 * @returns default constructed token
	 */
	public static CreateDefault: () => Token = () => {
		const token = new Token();
		return token;
	}

	/**
	 * Private initialisation function called in {@link Token.Create}
	 * @private
	 * @param tokenInfo {@link IToken | IToken interface props}
	 */
	private init: (tokenInfo: IToken) => Promise<void> = async (tokenInfo) => {
		this.provider = tokenInfo.provider;
		this.address = tokenInfo.address;

		const contract = ERC20__factory.connect(
			tokenInfo.address,
			tokenInfo.provider
		);

		this._contract = contract;

		const [name, symbol, decimals] = await Promise.all([
			tokenInfo?.name ? tokenInfo?.name : contract.name(),
			tokenInfo?.symbol ? tokenInfo?.symbol : contract.symbol(),
			tokenInfo?.decimals ? tokenInfo?.decimals : contract.decimals(),
		])

		this.name = name;
		this.symbol = symbol;
		this.decimals = decimals;
	}

	/**
	 * Fetch an accounts balance for this token
	 * @param account Account to check balance of
	 * @returns The accounts balance formatted in a BigNumber
	 */
	public fetchBalance: (account: string) => Promise<BigNumber> = async (account) => {
		if (!this._contract) {
			throw Error("Failed to fetch balance: this._contract undefined")
		}
		const balanceOf = await this._contract.balanceOf(account).catch((error) => {
			throw Error("Failed to fetch balance: " + error?.message)
		});
		return (new BigNumber (ethers.utils.formatUnits(balanceOf, this.decimals)));
	}

	/**
	 * Fetch an accounts allowance for a given spender
	 * @param account Account to check allowance
	 * @param spender Spender of the accounts tokens
	 * @returns the allowance the account has given to the spender address to spend this token
	 */
	public fetchAllowance: (spender: string, account: string) => Promise<BigNumber> = async (account, spender) => {
		if (!this._contract) {
			throw Error("Failed to fetch allowance: this._contract undefined")
		}
		const balanceOf = await this._contract.allowance(account, spender).catch((error) => {
			throw Error("Failed to fetch allowance: " + error?.message);
		});
		return (new BigNumber (ethers.utils.formatUnits(balanceOf, this.decimals)));
	}

	/**
	 * Approve a spender to spend the signers accounts tokens
	 * @param spender the address of the contract that will spend the tokens
	 * @param amount the amount the signer is allowing the spender to spend
	 * @returns an ethers transaction
	 */
	public approve: (spender: string, amount: number | BigNumber) => Promise<ethers.ContractTransaction> = async (spender, amount) => {
		if (!this._contract) {
			throw Error("Failed to approve token: this._contract undefined")
		}
		return this._contract.approve(spender, ethers.utils.formatUnits(amount.toString(), this.decimals));
	}

	/**
	 * Replaces the provider and connects the contract instance
	 * @param provider The new provider to connect to
	 */
	public connect: (provider: ethers.providers.Provider | ethers.Signer) => void = (provider) => {
		if (!provider) {
			throw Error("Failed to connect Token: provider cannot be undefined")
		}
		this.provider = provider;
		this._contract = this._contract?.connect(provider);
	}
}
