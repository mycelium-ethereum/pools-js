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

### Pools
The main class for interacting with LeveragedPools. To get started its as simple as
```javascript
import { Pool } from '@tracer-protocol/pools-js'

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const poolAddress = "0xPoolAddress"

// option 1
const someAsyncFunc = async () => {
	const pool = await Pool.Create(poolAddress, provider);
	console.log(pool)
}

// option 2
Pool.Create(poolAddress, provider).then((pool) => {
	// pool initialized
	console.log(pool) // this log will be the same as above
})
```

Once the pool is initialised you can use any of the functions listed within the docs.

### Tokens
To interact the tokens you can instantiate a token direcly if you know the contract address,
or it is automatically done when creating a pool. The two pool tokens
(`pool.longToken` and `pool.shortToken`) implement the same methods as `pool.quoteToken`, so any
functions used below can also be called on `pool.quoteToken`.

```javascript
import { Pool, SideEnum } from '@tracer-protocol/pools-js'

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const poolAddress = "0xPoolAddress"

const someAsyncFunc = async () => {
	const pool = await Pool.Create({
		address: poolAddress, 
		provider
	});

	let token = pool.longToken;
	const balance = await token.fetchBalance("0xSomeAddress")

	// or if you know the token contract
	token = await PoolToken.Create({
		address: "0xLongTokenAddress", 
		provider,
		side: SideEnum.long
	})
	const balance = await token.fetchBalance("0xSomeAddress")
}
```
