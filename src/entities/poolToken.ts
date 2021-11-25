import { PoolToken__factory, PoolToken as PoolTokenContract } from "@tracer-protocol/perpetual-pools-contracts/types";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { SideEnum } from "..";
import { IToken } from "./token";


/**
 * PoolToken class constructor inputs
 */
export interface IPoolToken extends IToken {
	pool: string;
	side: SideEnum;
}

export default class PoolToken {
	_contract?: PoolTokenContract
	address: string;
	provider: ethers.providers.Provider | ethers.Signer;
	name: string;
	symbol: string;
	decimals: number;
	pool: string;
	side: SideEnum;
	supply: BigNumber;

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
		this.pool = '';
		// not ideal but it can default to a long token
		this.side = SideEnum.long;
		this.supply = new BigNumber(0);
	}

	/**
	 * Replacement constructor pattern to support async initialisations
	 * @param tokenINfo {@link IPoolToken | IPoolToken interface props}
	 * @returns a Promise containing an initialised PoolToken class ready to be used
	 */
	public static Create: (tokenInfo: IPoolToken) => Promise<PoolToken> = async (tokenInfo) => {
		const token = new PoolToken();
		await token.init(tokenInfo);
		return token;
	}

	/**
	 * Creates an empty PoolToken that can be used as a default
	 * @returns default constructed pool token
	 */
	public static CreateDefault: () => PoolToken = () => {
		const token = new PoolToken();
		return token;
	}

	/**
	 * Private initialisation function called in {@link PoolToken.Create}
	 * @param tokenInfo {@link IPoolToken | IPoolToken interface props}
	 */
	private init: (tokenInfo: IPoolToken) => void = async (tokenInfo) => {
		this.provider = tokenInfo.provider;
		this.address = tokenInfo.address;
		this.pool = tokenInfo.pool;
		this.side = tokenInfo.side;

		const contract = PoolToken__factory.connect(
			tokenInfo.address,
			tokenInfo.provider,
		)
		this._contract = contract;

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
	 * @returns the allowance the account has given to the spender address to spend this pool token
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
	 * Approve a spender to spend the signers accounts pool tokens
	 * @param spender the address of the contract that will spend the pool tokens
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
			throw Error("Failed to connect PoolToken: provider cannot be undefined")
		}
		this.provider = provider;
		this._contract = this._contract?.connect(provider);
	}
}