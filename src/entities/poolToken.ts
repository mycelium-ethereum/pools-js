import { PoolToken__factory, PoolToken as PoolTokenContract } from "@tracer-protocol/perpetual-pools-contracts/types";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { IToken } from "./token";

export interface IPoolToken extends IToken {
	pool: string;
}

export default class PoolToken {
	address: string;
	provider: ethers.providers.JsonRpcProvider;
	name: string;
	symbol: string;
	decimals: number;
	pool: string;
	supply: BigNumber;

	private constructor () {
		// these all need to be ovverridden in the init function
		this.address = '';
		this.provider = new ethers.providers.JsonRpcProvider('');
		this.name = '';
		this.symbol = '';
		this.decimals = 18;
		this.pool = '';
		this.supply = new BigNumber(0);
	} // private constructor

	public static Create: (tokenInfo: IPoolToken) => Promise<PoolToken> = async (tokenInfo) => {
		const token = new PoolToken();
		// initialise the token;
		await token.init(tokenInfo);
		return token;
	}

	private init: (tokenInfo: IPoolToken) => void = async (tokenInfo) => {
		this.provider = tokenInfo.provider;
		this.address = tokenInfo.address;
		this.pool = tokenInfo.pool;

		const contract = new ethers.Contract(
			tokenInfo.address,
			PoolToken__factory.abi,
			tokenInfo.provider,
		) as PoolTokenContract;

		const [name, symbol, decimals, supply] = await Promise.all([
			tokenInfo?.name ? tokenInfo?.name : contract.name(),
			tokenInfo?.symbol ? tokenInfo?.symbol : contract.symbol(),
			tokenInfo?.decimals ? tokenInfo?.decimals : contract.decimals(),
			contract.totalSupply(),
		])

		this.name = name;
		this.symbol = symbol;
		this.decimals = decimals;
		this.supply = new BigNumber(ethers.utils.formatUnits(supply, decimals))
	}
}