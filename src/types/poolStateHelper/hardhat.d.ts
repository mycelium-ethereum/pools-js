/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomiclabs/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "IERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20__factory>;
    getContractFactory(
      name: "ILeveragedPool",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ILeveragedPool__factory>;
    getContractFactory(
      name: "IOracleWrapper",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IOracleWrapper__factory>;
    getContractFactory(
      name: "IPoolCommitter",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IPoolCommitter__factory>;
    getContractFactory(
      name: "IPoolKeeper",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IPoolKeeper__factory>;
    getContractFactory(
      name: "PoolSwapLibrary",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.PoolSwapLibrary__factory>;
    getContractFactory(
      name: "IERC20WithDecimals",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20WithDecimals__factory>;
    getContractFactory(
      name: "ILeveragedPool2",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ILeveragedPool2__factory>;
    getContractFactory(
      name: "IPoolCommitter2",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IPoolCommitter2__factory>;
    getContractFactory(
      name: "IPoolKeeper2",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IPoolKeeper2__factory>;
    getContractFactory(
      name: "IPoolStateHelper",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IPoolStateHelper__factory>;
    getContractFactory(
      name: "ISMAOracle",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ISMAOracle__factory>;
    getContractFactory(
      name: "PoolStateHelper",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.PoolStateHelper__factory>;

    getContractAt(
      name: "IERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20>;
    getContractAt(
      name: "ILeveragedPool",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ILeveragedPool>;
    getContractAt(
      name: "IOracleWrapper",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IOracleWrapper>;
    getContractAt(
      name: "IPoolCommitter",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IPoolCommitter>;
    getContractAt(
      name: "IPoolKeeper",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IPoolKeeper>;
    getContractAt(
      name: "PoolSwapLibrary",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.PoolSwapLibrary>;
    getContractAt(
      name: "IERC20WithDecimals",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20WithDecimals>;
    getContractAt(
      name: "ILeveragedPool2",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ILeveragedPool2>;
    getContractAt(
      name: "IPoolCommitter2",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IPoolCommitter2>;
    getContractAt(
      name: "IPoolKeeper2",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IPoolKeeper2>;
    getContractAt(
      name: "IPoolStateHelper",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IPoolStateHelper>;
    getContractAt(
      name: "ISMAOracle",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ISMAOracle>;
    getContractAt(
      name: "PoolStateHelper",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.PoolStateHelper>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.utils.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
  }
}