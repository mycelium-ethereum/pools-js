import { ERC20__factory, ERC20 } from "@tracer-protocol/perpetual-pools-contracts/types";
import { ethers } from "ethers";
import { IContract } from "../types";


export interface IToken extends IContract, TokenInfo {}

export interface TokenInfo {
	address: string;
	name?: string;
	symbol?: string;
	decimals?: number;
}

export default class Token {
	address: string;
	provider: ethers.providers.JsonRpcProvider;
	name: string;
	symbol: string;
	decimals: number;

	private constructor () {
		// these all need to be ovverridden in the init function
		this.address = '';
		this.provider = new ethers.providers.JsonRpcProvider('');
		this.name = '';
		this.symbol = '';
		this.decimals = 18;
	} // private constructor

	public static Create: (tokenInfo: IToken) => Promise<Token> = async (tokenInfo) => {
		const token = new Token();
		// initialise the token;
		await token.init(tokenInfo);
		return token;
	}

	private init: (tokenInfo: IToken) => void = async (tokenInfo) => {
		this.provider = tokenInfo.provider;
		this.address = tokenInfo.address;

		const contract = new ethers.Contract(
			tokenInfo.address,
			ERC20__factory.abi,
			tokenInfo.provider,
		) as ERC20;

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