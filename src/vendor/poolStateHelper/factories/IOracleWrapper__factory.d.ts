import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IOracleWrapper, IOracleWrapperInterface } from "../IOracleWrapper";
export declare class IOracleWrapper__factory {
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
    static createInterface(): IOracleWrapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IOracleWrapper;
}
