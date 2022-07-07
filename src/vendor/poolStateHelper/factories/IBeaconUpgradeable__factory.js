"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IBeaconUpgradeable__factory = void 0;

var _ethers = require("ethers");

/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
const _abi = [{
  inputs: [],
  name: "implementation",
  outputs: [{
    internalType: "address",
    name: "",
    type: "address"
  }],
  stateMutability: "view",
  type: "function"
}];

class IBeaconUpgradeable__factory {
  static abi = _abi;

  static createInterface() {
    return new _ethers.utils.Interface(_abi);
  }

  static connect(address, signerOrProvider) {
    return new _ethers.Contract(address, _abi, signerOrProvider);
  }

}

exports.IBeaconUpgradeable__factory = IBeaconUpgradeable__factory;