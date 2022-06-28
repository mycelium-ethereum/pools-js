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

interface ILeveragedPool2Interface extends ethers.utils.Interface {
  functions: {
    "balances()": FunctionFragment;
    "burnTokens(uint256,uint256,address)": FunctionFragment;
    "claimPrimaryFees()": FunctionFragment;
    "claimSecondaryFees()": FunctionFragment;
    "fee()": FunctionFragment;
    "frontRunningInterval()": FunctionFragment;
    "getOraclePrice()": FunctionFragment;
    "getUpkeepInformation()": FunctionFragment;
    "initialize((address,address,address,address,address,address,address,address,string,uint32,uint32,uint16,uint256,address,address,address,uint256))": FunctionFragment;
    "intervalPassed()": FunctionFragment;
    "keeper()": FunctionFragment;
    "lastPriceTimestamp()": FunctionFragment;
    "leverageAmount()": FunctionFragment;
    "longBalance()": FunctionFragment;
    "oracleWrapper()": FunctionFragment;
    "payKeeperFromBalances(address,uint256)": FunctionFragment;
    "poolCommitter()": FunctionFragment;
    "poolName()": FunctionFragment;
    "poolTokenTransfer(bool,address,uint256)": FunctionFragment;
    "poolTokens()": FunctionFragment;
    "poolUpkeep(int256,int256)": FunctionFragment;
    "primaryFees()": FunctionFragment;
    "secondaryFees()": FunctionFragment;
    "setKeeper(address)": FunctionFragment;
    "setNewPoolBalances(uint256,uint256)": FunctionFragment;
    "settlementEthOracle()": FunctionFragment;
    "settlementToken()": FunctionFragment;
    "settlementTokenTransfer(address,uint256)": FunctionFragment;
    "settlementTokenTransferFrom(address,address,uint256)": FunctionFragment;
    "shortBalance()": FunctionFragment;
    "updateFeeAddress(address)": FunctionFragment;
    "updateInterval()": FunctionFragment;
    "updateSecondaryFeeAddress(address)": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "balances", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "burnTokens",
    values: [BigNumberish, BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "claimPrimaryFees",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "claimSecondaryFees",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "fee", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "frontRunningInterval",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getOraclePrice",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getUpkeepInformation",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [
      {
        _owner: string;
        _keeper: string;
        _oracleWrapper: string;
        _settlementEthOracle: string;
        _longToken: string;
        _shortToken: string;
        _poolCommitter: string;
        _invariantCheck: string;
        _poolName: string;
        _frontRunningInterval: BigNumberish;
        _updateInterval: BigNumberish;
        _leverageAmount: BigNumberish;
        _fee: BigNumberish;
        _feeAddress: string;
        _secondaryFeeAddress: string;
        _settlementToken: string;
        _secondaryFeeSplitPercent: BigNumberish;
      }
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "intervalPassed",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "keeper", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "lastPriceTimestamp",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "leverageAmount",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "longBalance",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "oracleWrapper",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "payKeeperFromBalances",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "poolCommitter",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "poolName", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "poolTokenTransfer",
    values: [boolean, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "poolTokens",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "poolUpkeep",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "primaryFees",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "secondaryFees",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "setKeeper", values: [string]): string;
  encodeFunctionData(
    functionFragment: "setNewPoolBalances",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "settlementEthOracle",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "settlementToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "settlementTokenTransfer",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "settlementTokenTransferFrom",
    values: [string, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "shortBalance",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "updateFeeAddress",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "updateInterval",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "updateSecondaryFeeAddress",
    values: [string]
  ): string;

  decodeFunctionResult(functionFragment: "balances", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "burnTokens", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "claimPrimaryFees",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "claimSecondaryFees",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "fee", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "frontRunningInterval",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOraclePrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getUpkeepInformation",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "intervalPassed",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "keeper", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "lastPriceTimestamp",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "leverageAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "longBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "oracleWrapper",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "payKeeperFromBalances",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "poolCommitter",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "poolName", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "poolTokenTransfer",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "poolTokens", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "poolUpkeep", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "primaryFees",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "secondaryFees",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setKeeper", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setNewPoolBalances",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "settlementEthOracle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "settlementToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "settlementTokenTransfer",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "settlementTokenTransferFrom",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "shortBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateFeeAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateInterval",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateSecondaryFeeAddress",
    data: BytesLike
  ): Result;

  events: {
    "FeeAddressUpdated(address,address)": EventFragment;
    "KeeperAddressChanged(address,address)": EventFragment;
    "PoolBalancesChanged(uint256,uint256)": EventFragment;
    "PoolInitialized(address,address,address,string)": EventFragment;
    "PoolRebalance(int256,int256,uint256,uint256)": EventFragment;
    "PriceChangeError(int256,int256)": EventFragment;
    "PrimaryFeesPaid(address,uint256)": EventFragment;
    "SecondaryFeeAddressUpdated(address,address)": EventFragment;
    "SecondaryFeesPaid(address,uint256)": EventFragment;
    "SettlementWithdrawn(address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "FeeAddressUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "KeeperAddressChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PoolBalancesChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PoolInitialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PoolRebalance"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PriceChangeError"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PrimaryFeesPaid"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SecondaryFeeAddressUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SecondaryFeesPaid"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SettlementWithdrawn"): EventFragment;
}

export type FeeAddressUpdatedEvent = TypedEvent<
  [string, string] & { oldAddress: string; newAddress: string }
>;

export type KeeperAddressChangedEvent = TypedEvent<
  [string, string] & { oldAddress: string; newAddress: string }
>;

export type PoolBalancesChangedEvent = TypedEvent<
  [BigNumber, BigNumber] & { long: BigNumber; short: BigNumber }
>;

export type PoolInitializedEvent = TypedEvent<
  [string, string, string, string] & {
    longToken: string;
    shortToken: string;
    settlementToken: string;
    poolName: string;
  }
>;

export type PoolRebalanceEvent = TypedEvent<
  [BigNumber, BigNumber, BigNumber, BigNumber] & {
    shortBalanceChange: BigNumber;
    longBalanceChange: BigNumber;
    shortFeeAmount: BigNumber;
    longFeeAmount: BigNumber;
  }
>;

export type PriceChangeErrorEvent = TypedEvent<
  [BigNumber, BigNumber] & { startPrice: BigNumber; endPrice: BigNumber }
>;

export type PrimaryFeesPaidEvent = TypedEvent<
  [string, BigNumber] & { feeAddress: string; amount: BigNumber }
>;

export type SecondaryFeeAddressUpdatedEvent = TypedEvent<
  [string, string] & { oldAddress: string; newAddress: string }
>;

export type SecondaryFeesPaidEvent = TypedEvent<
  [string, BigNumber] & { secondaryFeeAddress: string; amount: BigNumber }
>;

export type SettlementWithdrawnEvent = TypedEvent<
  [string, BigNumber] & { to: string; quantity: BigNumber }
>;

export class ILeveragedPool2 extends BaseContract {
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

  interface: ILeveragedPool2Interface;

  functions: {
    balances(
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        _shortBalance: BigNumber;
        _longBalance: BigNumber;
      }
    >;

    burnTokens(
      tokenType: BigNumberish,
      amount: BigNumberish,
      burner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    claimPrimaryFees(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    claimSecondaryFees(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    fee(overrides?: CallOverrides): Promise<[string]>;

    frontRunningInterval(overrides?: CallOverrides): Promise<[number]>;

    getOraclePrice(overrides?: CallOverrides): Promise<[BigNumber]>;

    getUpkeepInformation(
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, string, BigNumber, BigNumber] & {
        _latestPrice: BigNumber;
        _data: string;
        _lastPriceTimestamp: BigNumber;
        _updateInterval: BigNumber;
      }
    >;

    initialize(
      initialization: {
        _owner: string;
        _keeper: string;
        _oracleWrapper: string;
        _settlementEthOracle: string;
        _longToken: string;
        _shortToken: string;
        _poolCommitter: string;
        _invariantCheck: string;
        _poolName: string;
        _frontRunningInterval: BigNumberish;
        _updateInterval: BigNumberish;
        _leverageAmount: BigNumberish;
        _fee: BigNumberish;
        _feeAddress: string;
        _secondaryFeeAddress: string;
        _settlementToken: string;
        _secondaryFeeSplitPercent: BigNumberish;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    intervalPassed(overrides?: CallOverrides): Promise<[boolean]>;

    keeper(overrides?: CallOverrides): Promise<[string]>;

    lastPriceTimestamp(overrides?: CallOverrides): Promise<[BigNumber]>;

    leverageAmount(overrides?: CallOverrides): Promise<[string]>;

    longBalance(overrides?: CallOverrides): Promise<[BigNumber]>;

    oracleWrapper(overrides?: CallOverrides): Promise<[string]>;

    payKeeperFromBalances(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    poolCommitter(overrides?: CallOverrides): Promise<[string]>;

    poolName(overrides?: CallOverrides): Promise<[string]>;

    poolTokenTransfer(
      isLongToken: boolean,
      to: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    poolTokens(overrides?: CallOverrides): Promise<[[string, string]]>;

    poolUpkeep(
      _oldPrice: BigNumberish,
      _newPrice: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    primaryFees(overrides?: CallOverrides): Promise<[BigNumber]>;

    secondaryFees(overrides?: CallOverrides): Promise<[BigNumber]>;

    setKeeper(
      _keeper: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setNewPoolBalances(
      _longBalance: BigNumberish,
      _shortBalance: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    settlementEthOracle(overrides?: CallOverrides): Promise<[string]>;

    settlementToken(overrides?: CallOverrides): Promise<[string]>;

    settlementTokenTransfer(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    settlementTokenTransferFrom(
      from: string,
      to: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    shortBalance(overrides?: CallOverrides): Promise<[BigNumber]>;

    updateFeeAddress(
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateInterval(overrides?: CallOverrides): Promise<[number]>;

    updateSecondaryFeeAddress(
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  balances(
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & {
      _shortBalance: BigNumber;
      _longBalance: BigNumber;
    }
  >;

  burnTokens(
    tokenType: BigNumberish,
    amount: BigNumberish,
    burner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  claimPrimaryFees(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  claimSecondaryFees(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  fee(overrides?: CallOverrides): Promise<string>;

  frontRunningInterval(overrides?: CallOverrides): Promise<number>;

  getOraclePrice(overrides?: CallOverrides): Promise<BigNumber>;

  getUpkeepInformation(
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, string, BigNumber, BigNumber] & {
      _latestPrice: BigNumber;
      _data: string;
      _lastPriceTimestamp: BigNumber;
      _updateInterval: BigNumber;
    }
  >;

  initialize(
    initialization: {
      _owner: string;
      _keeper: string;
      _oracleWrapper: string;
      _settlementEthOracle: string;
      _longToken: string;
      _shortToken: string;
      _poolCommitter: string;
      _invariantCheck: string;
      _poolName: string;
      _frontRunningInterval: BigNumberish;
      _updateInterval: BigNumberish;
      _leverageAmount: BigNumberish;
      _fee: BigNumberish;
      _feeAddress: string;
      _secondaryFeeAddress: string;
      _settlementToken: string;
      _secondaryFeeSplitPercent: BigNumberish;
    },
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  intervalPassed(overrides?: CallOverrides): Promise<boolean>;

  keeper(overrides?: CallOverrides): Promise<string>;

  lastPriceTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

  leverageAmount(overrides?: CallOverrides): Promise<string>;

  longBalance(overrides?: CallOverrides): Promise<BigNumber>;

  oracleWrapper(overrides?: CallOverrides): Promise<string>;

  payKeeperFromBalances(
    to: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  poolCommitter(overrides?: CallOverrides): Promise<string>;

  poolName(overrides?: CallOverrides): Promise<string>;

  poolTokenTransfer(
    isLongToken: boolean,
    to: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  poolTokens(overrides?: CallOverrides): Promise<[string, string]>;

  poolUpkeep(
    _oldPrice: BigNumberish,
    _newPrice: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  primaryFees(overrides?: CallOverrides): Promise<BigNumber>;

  secondaryFees(overrides?: CallOverrides): Promise<BigNumber>;

  setKeeper(
    _keeper: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setNewPoolBalances(
    _longBalance: BigNumberish,
    _shortBalance: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  settlementEthOracle(overrides?: CallOverrides): Promise<string>;

  settlementToken(overrides?: CallOverrides): Promise<string>;

  settlementTokenTransfer(
    to: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  settlementTokenTransferFrom(
    from: string,
    to: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  shortBalance(overrides?: CallOverrides): Promise<BigNumber>;

  updateFeeAddress(
    account: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateInterval(overrides?: CallOverrides): Promise<number>;

  updateSecondaryFeeAddress(
    account: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    balances(
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        _shortBalance: BigNumber;
        _longBalance: BigNumber;
      }
    >;

    burnTokens(
      tokenType: BigNumberish,
      amount: BigNumberish,
      burner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    claimPrimaryFees(overrides?: CallOverrides): Promise<void>;

    claimSecondaryFees(overrides?: CallOverrides): Promise<void>;

    fee(overrides?: CallOverrides): Promise<string>;

    frontRunningInterval(overrides?: CallOverrides): Promise<number>;

    getOraclePrice(overrides?: CallOverrides): Promise<BigNumber>;

    getUpkeepInformation(
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, string, BigNumber, BigNumber] & {
        _latestPrice: BigNumber;
        _data: string;
        _lastPriceTimestamp: BigNumber;
        _updateInterval: BigNumber;
      }
    >;

    initialize(
      initialization: {
        _owner: string;
        _keeper: string;
        _oracleWrapper: string;
        _settlementEthOracle: string;
        _longToken: string;
        _shortToken: string;
        _poolCommitter: string;
        _invariantCheck: string;
        _poolName: string;
        _frontRunningInterval: BigNumberish;
        _updateInterval: BigNumberish;
        _leverageAmount: BigNumberish;
        _fee: BigNumberish;
        _feeAddress: string;
        _secondaryFeeAddress: string;
        _settlementToken: string;
        _secondaryFeeSplitPercent: BigNumberish;
      },
      overrides?: CallOverrides
    ): Promise<void>;

    intervalPassed(overrides?: CallOverrides): Promise<boolean>;

    keeper(overrides?: CallOverrides): Promise<string>;

    lastPriceTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

    leverageAmount(overrides?: CallOverrides): Promise<string>;

    longBalance(overrides?: CallOverrides): Promise<BigNumber>;

    oracleWrapper(overrides?: CallOverrides): Promise<string>;

    payKeeperFromBalances(
      to: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    poolCommitter(overrides?: CallOverrides): Promise<string>;

    poolName(overrides?: CallOverrides): Promise<string>;

    poolTokenTransfer(
      isLongToken: boolean,
      to: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    poolTokens(overrides?: CallOverrides): Promise<[string, string]>;

    poolUpkeep(
      _oldPrice: BigNumberish,
      _newPrice: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    primaryFees(overrides?: CallOverrides): Promise<BigNumber>;

    secondaryFees(overrides?: CallOverrides): Promise<BigNumber>;

    setKeeper(_keeper: string, overrides?: CallOverrides): Promise<void>;

    setNewPoolBalances(
      _longBalance: BigNumberish,
      _shortBalance: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    settlementEthOracle(overrides?: CallOverrides): Promise<string>;

    settlementToken(overrides?: CallOverrides): Promise<string>;

    settlementTokenTransfer(
      to: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    settlementTokenTransferFrom(
      from: string,
      to: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    shortBalance(overrides?: CallOverrides): Promise<BigNumber>;

    updateFeeAddress(account: string, overrides?: CallOverrides): Promise<void>;

    updateInterval(overrides?: CallOverrides): Promise<number>;

    updateSecondaryFeeAddress(
      account: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "FeeAddressUpdated(address,address)"(
      oldAddress?: string | null,
      newAddress?: string | null
    ): TypedEventFilter<
      [string, string],
      { oldAddress: string; newAddress: string }
    >;

    FeeAddressUpdated(
      oldAddress?: string | null,
      newAddress?: string | null
    ): TypedEventFilter<
      [string, string],
      { oldAddress: string; newAddress: string }
    >;

    "KeeperAddressChanged(address,address)"(
      oldAddress?: string | null,
      newAddress?: string | null
    ): TypedEventFilter<
      [string, string],
      { oldAddress: string; newAddress: string }
    >;

    KeeperAddressChanged(
      oldAddress?: string | null,
      newAddress?: string | null
    ): TypedEventFilter<
      [string, string],
      { oldAddress: string; newAddress: string }
    >;

    "PoolBalancesChanged(uint256,uint256)"(
      long?: BigNumberish | null,
      short?: BigNumberish | null
    ): TypedEventFilter<
      [BigNumber, BigNumber],
      { long: BigNumber; short: BigNumber }
    >;

    PoolBalancesChanged(
      long?: BigNumberish | null,
      short?: BigNumberish | null
    ): TypedEventFilter<
      [BigNumber, BigNumber],
      { long: BigNumber; short: BigNumber }
    >;

    "PoolInitialized(address,address,address,string)"(
      longToken?: string | null,
      shortToken?: string | null,
      settlementToken?: null,
      poolName?: null
    ): TypedEventFilter<
      [string, string, string, string],
      {
        longToken: string;
        shortToken: string;
        settlementToken: string;
        poolName: string;
      }
    >;

    PoolInitialized(
      longToken?: string | null,
      shortToken?: string | null,
      settlementToken?: null,
      poolName?: null
    ): TypedEventFilter<
      [string, string, string, string],
      {
        longToken: string;
        shortToken: string;
        settlementToken: string;
        poolName: string;
      }
    >;

    "PoolRebalance(int256,int256,uint256,uint256)"(
      shortBalanceChange?: null,
      longBalanceChange?: null,
      shortFeeAmount?: null,
      longFeeAmount?: null
    ): TypedEventFilter<
      [BigNumber, BigNumber, BigNumber, BigNumber],
      {
        shortBalanceChange: BigNumber;
        longBalanceChange: BigNumber;
        shortFeeAmount: BigNumber;
        longFeeAmount: BigNumber;
      }
    >;

    PoolRebalance(
      shortBalanceChange?: null,
      longBalanceChange?: null,
      shortFeeAmount?: null,
      longFeeAmount?: null
    ): TypedEventFilter<
      [BigNumber, BigNumber, BigNumber, BigNumber],
      {
        shortBalanceChange: BigNumber;
        longBalanceChange: BigNumber;
        shortFeeAmount: BigNumber;
        longFeeAmount: BigNumber;
      }
    >;

    "PriceChangeError(int256,int256)"(
      startPrice?: BigNumberish | null,
      endPrice?: BigNumberish | null
    ): TypedEventFilter<
      [BigNumber, BigNumber],
      { startPrice: BigNumber; endPrice: BigNumber }
    >;

    PriceChangeError(
      startPrice?: BigNumberish | null,
      endPrice?: BigNumberish | null
    ): TypedEventFilter<
      [BigNumber, BigNumber],
      { startPrice: BigNumber; endPrice: BigNumber }
    >;

    "PrimaryFeesPaid(address,uint256)"(
      feeAddress?: string | null,
      amount?: null
    ): TypedEventFilter<
      [string, BigNumber],
      { feeAddress: string; amount: BigNumber }
    >;

    PrimaryFeesPaid(
      feeAddress?: string | null,
      amount?: null
    ): TypedEventFilter<
      [string, BigNumber],
      { feeAddress: string; amount: BigNumber }
    >;

    "SecondaryFeeAddressUpdated(address,address)"(
      oldAddress?: string | null,
      newAddress?: string | null
    ): TypedEventFilter<
      [string, string],
      { oldAddress: string; newAddress: string }
    >;

    SecondaryFeeAddressUpdated(
      oldAddress?: string | null,
      newAddress?: string | null
    ): TypedEventFilter<
      [string, string],
      { oldAddress: string; newAddress: string }
    >;

    "SecondaryFeesPaid(address,uint256)"(
      secondaryFeeAddress?: string | null,
      amount?: null
    ): TypedEventFilter<
      [string, BigNumber],
      { secondaryFeeAddress: string; amount: BigNumber }
    >;

    SecondaryFeesPaid(
      secondaryFeeAddress?: string | null,
      amount?: null
    ): TypedEventFilter<
      [string, BigNumber],
      { secondaryFeeAddress: string; amount: BigNumber }
    >;

    "SettlementWithdrawn(address,uint256)"(
      to?: string | null,
      quantity?: BigNumberish | null
    ): TypedEventFilter<
      [string, BigNumber],
      { to: string; quantity: BigNumber }
    >;

    SettlementWithdrawn(
      to?: string | null,
      quantity?: BigNumberish | null
    ): TypedEventFilter<
      [string, BigNumber],
      { to: string; quantity: BigNumber }
    >;
  };

  estimateGas: {
    balances(overrides?: CallOverrides): Promise<BigNumber>;

    burnTokens(
      tokenType: BigNumberish,
      amount: BigNumberish,
      burner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    claimPrimaryFees(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    claimSecondaryFees(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    fee(overrides?: CallOverrides): Promise<BigNumber>;

    frontRunningInterval(overrides?: CallOverrides): Promise<BigNumber>;

    getOraclePrice(overrides?: CallOverrides): Promise<BigNumber>;

    getUpkeepInformation(overrides?: CallOverrides): Promise<BigNumber>;

    initialize(
      initialization: {
        _owner: string;
        _keeper: string;
        _oracleWrapper: string;
        _settlementEthOracle: string;
        _longToken: string;
        _shortToken: string;
        _poolCommitter: string;
        _invariantCheck: string;
        _poolName: string;
        _frontRunningInterval: BigNumberish;
        _updateInterval: BigNumberish;
        _leverageAmount: BigNumberish;
        _fee: BigNumberish;
        _feeAddress: string;
        _secondaryFeeAddress: string;
        _settlementToken: string;
        _secondaryFeeSplitPercent: BigNumberish;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    intervalPassed(overrides?: CallOverrides): Promise<BigNumber>;

    keeper(overrides?: CallOverrides): Promise<BigNumber>;

    lastPriceTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

    leverageAmount(overrides?: CallOverrides): Promise<BigNumber>;

    longBalance(overrides?: CallOverrides): Promise<BigNumber>;

    oracleWrapper(overrides?: CallOverrides): Promise<BigNumber>;

    payKeeperFromBalances(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    poolCommitter(overrides?: CallOverrides): Promise<BigNumber>;

    poolName(overrides?: CallOverrides): Promise<BigNumber>;

    poolTokenTransfer(
      isLongToken: boolean,
      to: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    poolTokens(overrides?: CallOverrides): Promise<BigNumber>;

    poolUpkeep(
      _oldPrice: BigNumberish,
      _newPrice: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    primaryFees(overrides?: CallOverrides): Promise<BigNumber>;

    secondaryFees(overrides?: CallOverrides): Promise<BigNumber>;

    setKeeper(
      _keeper: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setNewPoolBalances(
      _longBalance: BigNumberish,
      _shortBalance: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    settlementEthOracle(overrides?: CallOverrides): Promise<BigNumber>;

    settlementToken(overrides?: CallOverrides): Promise<BigNumber>;

    settlementTokenTransfer(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    settlementTokenTransferFrom(
      from: string,
      to: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    shortBalance(overrides?: CallOverrides): Promise<BigNumber>;

    updateFeeAddress(
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateInterval(overrides?: CallOverrides): Promise<BigNumber>;

    updateSecondaryFeeAddress(
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    balances(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    burnTokens(
      tokenType: BigNumberish,
      amount: BigNumberish,
      burner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    claimPrimaryFees(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    claimSecondaryFees(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    fee(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    frontRunningInterval(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getOraclePrice(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getUpkeepInformation(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    initialize(
      initialization: {
        _owner: string;
        _keeper: string;
        _oracleWrapper: string;
        _settlementEthOracle: string;
        _longToken: string;
        _shortToken: string;
        _poolCommitter: string;
        _invariantCheck: string;
        _poolName: string;
        _frontRunningInterval: BigNumberish;
        _updateInterval: BigNumberish;
        _leverageAmount: BigNumberish;
        _fee: BigNumberish;
        _feeAddress: string;
        _secondaryFeeAddress: string;
        _settlementToken: string;
        _secondaryFeeSplitPercent: BigNumberish;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    intervalPassed(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    keeper(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    lastPriceTimestamp(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    leverageAmount(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    longBalance(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    oracleWrapper(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    payKeeperFromBalances(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    poolCommitter(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    poolName(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    poolTokenTransfer(
      isLongToken: boolean,
      to: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    poolTokens(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    poolUpkeep(
      _oldPrice: BigNumberish,
      _newPrice: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    primaryFees(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    secondaryFees(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setKeeper(
      _keeper: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setNewPoolBalances(
      _longBalance: BigNumberish,
      _shortBalance: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    settlementEthOracle(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    settlementToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    settlementTokenTransfer(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    settlementTokenTransferFrom(
      from: string,
      to: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    shortBalance(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    updateFeeAddress(
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateInterval(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    updateSecondaryFeeAddress(
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
