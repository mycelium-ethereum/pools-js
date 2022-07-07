import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IPoolKeeper2, IPoolKeeper2Interface } from "../IPoolKeeper2";
export declare class IPoolKeeper2__factory {
    static readonly abi: ({
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        outputs?: undefined;
        stateMutability?: undefined;
    } | {
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
        anonymous?: undefined;
    })[];
    static createInterface(): IPoolKeeper2Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): IPoolKeeper2;
}
