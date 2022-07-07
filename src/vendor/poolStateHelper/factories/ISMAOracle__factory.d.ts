import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ISMAOracle, ISMAOracleInterface } from "../ISMAOracle";
export declare class ISMAOracle__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): ISMAOracleInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ISMAOracle;
}
