import { SMAOracle as SMAOracleContract , SMAOracle__factory } from "@tracer-protocol/perpetual-pools-contracts/types";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { OracleClass, IContract } from "../types";

const defaultSMAOracle = {
	updateInterval: 60 * 60, // 1 hour
	numPeriods: 8,
}

/**
 * SMAOracle class constructor inputs
 */
export interface ISMAOracle extends IContract, SMAOracleInfo {}

/**
 * SMAOracle constructor props
 * Only `address` is required, additional props are encouraged
 * 	to reduce the number of RPC calls
 */
export interface SMAOracleInfo {
	address: string;
}

/**
 * SMAOracle class for interacting with ERC20 tokens
 * The constructor is private so must be instantiated with {@linkcode SMAOracle.Create}
 */
export default class SMAOracle implements OracleClass<SMAOracleContract> {
	_contract?: SMAOracleContract;
	address: string;
	provider: ethers.providers.Provider | ethers.Signer | undefined;
	updateInterval: number; //update interval in seconds
	numPeriods: number; // number of periods included in SMA calc 

	/**
	 * @private
	 */
	private constructor () {
		this.address = '';
		this.provider = undefined;
		this.updateInterval = defaultSMAOracle.updateInterval;
		this.numPeriods = defaultSMAOracle.numPeriods;
	}

	/**
	 * Replacement constructor pattern to support async initialisations
	 * @param tokenINfo {@link ISMAOracle | ISMAOracle interface props}
	 * @returns a Promise containing an initialised SMAOracle class ready to be used
	 */
	public static Create: (oracleInfo: ISMAOracle) => Promise<SMAOracle> = async (oracleInfo) => {
		const oracle = new SMAOracle();
		await oracle.init(oracleInfo);
		return oracle;
	}

	/**
	 * Creates an empty SMAOracle that can be used as a default
	 * @returns default constructed token
	 */
	public static CreateDefault: () => SMAOracle = () => {
		const oracle = new SMAOracle();
		return oracle;
	}

	/**
	 * Private initialisation function called in {@link SMAOracle.Create}
	 * @private
	 * @param oracleInfo {@link ISMAOracle | ISMAOracle interface props}
	 */
	private init: (oracleInfo: ISMAOracle) => Promise<void> = async (oracleInfo) => {
		this.provider = oracleInfo.provider;
		this.address = oracleInfo.address;

		const contract = SMAOracle__factory.connect(
			oracleInfo.address,
			oracleInfo.provider
		);
		this._contract = contract;
		const [updateInterval, numPeriods] = await Promise.all([
			contract.updateInterval(),
			contract.numPeriods()
		])
		this.updateInterval = updateInterval.toNumber();
		this.numPeriods = numPeriods.toNumber();
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

	/**
	 * Replaces the provider and connects the contract instance
	 * @param provider The new provider to connect to
	 */
	public connect: (provider: ethers.providers.Provider | ethers.Signer) => void = (provider) => {
		if (!provider) {
			throw Error("Failed to connect SMAOracle: provider cannot be undefined")
		}
		this.provider = provider;
		this._contract = this._contract?.connect(provider);
	}
}
