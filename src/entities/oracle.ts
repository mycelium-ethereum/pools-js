
import { ChainlinkOracleWrapper, ChainlinkOracleWrapper__factory } from "@tracer-protocol/perpetual-pools-contracts/types";
import BigNumber from "bignumber.js";
import { providers as MCProvider } from '@0xsequence/multicall';
import { ethers } from "ethers";
import { OracleClass, IContract } from "../types";

/**
 * Oracle class constructor inputs
 */
export interface IOracle extends IContract, OracleInfo { }

/**
 * Oracle constructor props
 * Only `address` is required, additional props are encouraged
 * 	to reduce the number of RPC calls
 */
export interface OracleInfo {
	address: string;
	symbol?: string;
	decimals?: number;
}

/**
 * Oracle class for interacting with Chainlink Oracle Wrappers
 * The constructor is private so must be instantiated with {@linkcode Oracle.Create}
 */
export default class Oracle implements OracleClass<ChainlinkOracleWrapper> {
	_contract?: ChainlinkOracleWrapper;
	address: string;
	provider: ethers.providers.Provider | ethers.Signer | undefined;
	multicallProvider: MCProvider.MulticallProvider | ethers.Signer | undefined;

	/**
	 * @private
	 */
	private constructor() {
		this.address = '';
		this.multicallProvider = undefined;
	}

	/**
	 * Replacement constructor pattern to support async initialisations
	 * @param oracleInfo {@link IOracle | IOracle interface props}
	 * @returns a Promise containing an initialised Oracle class ready to be used
	 */
	public static Create: (oracleInfo: IOracle) => Promise<Oracle> = async (oracleInfo) => {
		const oracle = new Oracle();
		// initialise the token;
		await oracle.init(oracleInfo);
		return oracle;
	}

	/**
	 * Creates an empty Oracle that can be used as a default
	 * @returns default constructed token
	 */
	public static CreateDefault: () => Oracle = () => {
		const oracle = new Oracle();
		return oracle;
	}

	/**
	 * Private initialisation function called in {@link Oracle.Create}
	 * @private
	 * @param oracleInfo {@link IOracle | IOracle interface props}
	 */
	private init: (oracleInfo: IOracle) => Promise<void> = async (oracleInfo) => {
		this.multicallProvider = new MCProvider.MulticallProvider(
			oracleInfo.provider as ethers.providers.Provider
		);
		this.address = oracleInfo.address;

		const contract = ChainlinkOracleWrapper__factory.connect(
			oracleInfo.address,
			this.multicallProvider
		);
		this._contract = contract;
	}

	/**
	 * Replaces the provider and connects the contract instance
	 * @param provider The new provider to connect to
	 */
	public connect: (provider: ethers.providers.Provider | ethers.Signer) => void = (provider) => {
		if (!provider) {
			throw Error("Failed to connect Oracle: provider cannot be undefined")
		}
		this.multicallProvider = new MCProvider.MulticallProvider(
			provider as ethers.providers.Provider
		);
		this._contract = this._contract?.connect(provider);
	}


	public getPrice: () => Promise<BigNumber> = async () => {
		if (!this._contract) {
			throw Error("Failed to fetch oracle price: Contract not defined");
		}
		try {
			const price = await this._contract.getPrice();
			return new BigNumber(ethers.utils.formatEther(price))
		} catch (err) {
			throw Error(`Failed to fetch oracle price: ${err}`)
		}
	}
}
