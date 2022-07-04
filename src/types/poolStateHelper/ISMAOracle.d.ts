/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface ISMAOracleInterface extends ethers.utils.Interface {
  functions: {
    "decimals()": FunctionFragment;
    "deployer()": FunctionFragment;
    "fromWad(int256)": FunctionFragment;
    "getPrice()": FunctionFragment;
    "getPriceAndMetadata()": FunctionFragment;
    "numPeriods()": FunctionFragment;
    "oracle()": FunctionFragment;
    "periodCount()": FunctionFragment;
    "poll()": FunctionFragment;
    "prices(int256)": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
  encodeFunctionData(functionFragment: "deployer", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "fromWad",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "getPrice", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getPriceAndMetadata",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "numPeriods",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "oracle", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "periodCount",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "poll", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "prices",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "deployer", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "fromWad", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getPrice", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getPriceAndMetadata",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "numPeriods", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "oracle", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "periodCount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "poll", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "prices", data: BytesLike): Result;

  events: {};
}

export class ISMAOracle extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: ISMAOracleInterface;

  functions: {
    decimals(overrides?: CallOverrides): Promise<[number]>;

    deployer(overrides?: CallOverrides): Promise<[string]>;

    fromWad(wad: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;

    getPrice(overrides?: CallOverrides): Promise<[BigNumber]>;

    getPriceAndMetadata(
      overrides?: CallOverrides
    ): Promise<[BigNumber, string] & { _price: BigNumber; _data: string }>;

    numPeriods(overrides?: CallOverrides): Promise<[BigNumber]>;

    oracle(overrides?: CallOverrides): Promise<[string]>;

    periodCount(overrides?: CallOverrides): Promise<[BigNumber]>;

    poll(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    prices(
      _numPeriod: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { price: BigNumber }>;
  };

  decimals(overrides?: CallOverrides): Promise<number>;

  deployer(overrides?: CallOverrides): Promise<string>;

  fromWad(wad: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

  getPrice(overrides?: CallOverrides): Promise<BigNumber>;

  getPriceAndMetadata(
    overrides?: CallOverrides
  ): Promise<[BigNumber, string] & { _price: BigNumber; _data: string }>;

  numPeriods(overrides?: CallOverrides): Promise<BigNumber>;

  oracle(overrides?: CallOverrides): Promise<string>;

  periodCount(overrides?: CallOverrides): Promise<BigNumber>;

  poll(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  prices(
    _numPeriod: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  callStatic: {
    decimals(overrides?: CallOverrides): Promise<number>;

    deployer(overrides?: CallOverrides): Promise<string>;

    fromWad(wad: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    getPrice(overrides?: CallOverrides): Promise<BigNumber>;

    getPriceAndMetadata(
      overrides?: CallOverrides
    ): Promise<[BigNumber, string] & { _price: BigNumber; _data: string }>;

    numPeriods(overrides?: CallOverrides): Promise<BigNumber>;

    oracle(overrides?: CallOverrides): Promise<string>;

    periodCount(overrides?: CallOverrides): Promise<BigNumber>;

    poll(overrides?: CallOverrides): Promise<BigNumber>;

    prices(
      _numPeriod: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    decimals(overrides?: CallOverrides): Promise<BigNumber>;

    deployer(overrides?: CallOverrides): Promise<BigNumber>;

    fromWad(wad: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    getPrice(overrides?: CallOverrides): Promise<BigNumber>;

    getPriceAndMetadata(overrides?: CallOverrides): Promise<BigNumber>;

    numPeriods(overrides?: CallOverrides): Promise<BigNumber>;

    oracle(overrides?: CallOverrides): Promise<BigNumber>;

    periodCount(overrides?: CallOverrides): Promise<BigNumber>;

    poll(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    prices(
      _numPeriod: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    deployer(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    fromWad(
      wad: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPrice(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getPriceAndMetadata(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    numPeriods(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    oracle(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    periodCount(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    poll(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    prices(
      _numPeriod: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}