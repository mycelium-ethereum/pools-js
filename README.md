# Pools JS SDK
A JS development kit with supported TypeScript typings.

## Installation

Since there is a yarn.lock, if you would like to use npm please run
`rm -r node_modules yarn.lock`

`npm install @tracer-protocol/pools-js` or `yarn add @tracer-protocol/pools-js`

## Testing
`yarn` or `npm run install`
`yarn build` or `npm run build`
`yarn test` or `npm run test`

## Documentation
`yarn` or `npm run install`
`yarn build:docs` or `npm run build:docs`
`npx serve ./docs`

## Entities
There are a number of entity classes relating to several of the contracts required to interact with pools.
The entry should be [pools](./src/entities/pool.ts) but you can instantiate any of the classes individually.

All entities follow the same design pattern of private constructors and public static `Create` functions.
This is to ensure that the class is initialized before use. You will always have to wait for the `Create`
function before accessing the internals of the promise. There is also a `CreateDefault` this provides an
interface for creating "empty" entities that can be used as default.

(A list of Pools related addresses can be found [here](https://tracerdao.notion.site/Tracer-Contract-Addresses-8dbf351d1a034be79f7a5c278775084d)

### Pools
The main class for interacting with LeveragedPools. To get started its as simple as
```javascript
import { Pool } from '@tracer-protocol/pools-js';
import ethers from 'ethers';

const provider = new ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");

// 3-ETH/USD
const poolAddress = "0x54114e9e1eEf979070091186D7102805819e916B";

// option 1
(async () => {
	const pool = await Pool.Create({
		address: poolAddress, 
		provider
	});
	console.log("First example long price", pool.getLongTokenPrice().toNumber());
})()

// option 2
Pool.Create({
	address: poolAddress, 
	provider
}).then((pool) => {
	// pool initialized
	console.log("Second example long price", pool.getLongTokenPrice().toNumber()); // this log will be the same as above
})
```

Once the pool is initialised you can use any of the functions listed within the docs.

### Tokens
To interact the tokens you can instantiate a token direcly if you know the contract address,
or it is automatically done when creating a pool. The two pool tokens
(`pool.longToken` and `pool.shortToken`) implement the same methods as `pool.quoteToken`, so any
functions used below can also be called on `pool.quoteToken`.

```javascript
import { Pool, SideEnum } from '@tracer-protocol/pools-js';
import ethers from 'ethers';
const provider = new ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");

// 3-ETH/USD
const poolAddress = "0x54114e9e1eEf979070091186D7102805819e916B";

(async () => {
	const pool = await Pool.Create({
		address: poolAddress, 
		provider
	});

	let token = pool.longToken;
	console.log("First example token name", token.name)

	// or if you know the token contract
	token = await PoolToken.Create({
		address: pool.longToken.address, 
		provider,
		side: SideEnum.long
	})
	console.log("Second example token name", token.name)
})()
```
