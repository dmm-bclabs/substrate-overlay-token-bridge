// Import the API
const { ApiPromise } = require('@polkadot/api');

// Known account we want to use (available on dev chain, with funds)
const Alice = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
const Bob = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';

async function main () {
  // Create an await for the API
  const api = await ApiPromise.create({
    // Add custom types
    types: {
      TokenBalance: "u128",
      ChildChainId: "u32"
    }
  })

  await showTokenStatus(api);
  await showTokenBalances(api);
}

async function showTokenStatus(api) {
  console.log(`=== show token status ===`);

  let init = await api.query.token.init();
  let totalSupply = await api.query.token.totalSupply();
  let localSupply = await api.query.token.localSupply();

  console.log(`Token init status: ${init}`);
  console.log(`Token Total Supply: ${totalSupply}`);
  console.log(`Token Local Supply: ${localSupply}`);
}

async function showTokenBalances(api) {
  console.log(`=== show token balances ===`);

  let balanceOf = {};
  balanceOf[Alice] = await api.query.token.balanceOf(Alice);
  balanceOf[Bob] = await api.query.token.balanceOf(Bob);

  console.log(`Balance of Alice: ${balanceOf[Alice]}`);
  console.log(`Balance of Bob: ${balanceOf[Bob]}`);
}

main().catch(console.error).finally(_ => process.exit());