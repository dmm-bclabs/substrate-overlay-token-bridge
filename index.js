// Import the API, Keyring and some utility functions
const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');

// Known account we want to use (available on dev chain, with funds)
const Alice = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
const Bob = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';

async function main () {
  // Create an await for the API
  const api = await ApiPromise.create({
    provider: new WsProvider('ws://127.0.0.1:9944'),
    // Add custom types
    types: {
      TokenBalance: "u128",
      ChildChainId: "u32"
    }
  });

  // Constuct the keying after the API (crypto has an async init)
  const keyring = new Keyring({ type: 'sr25519' });
  // Add alice to our keyring with a hard-deived path (empty phrase, so uses dev)
  const alice = keyring.addFromUri('//Alice');

  // Watch the token balance of Alice
  api.query.token.balanceOf(Alice, async () => {
    await showTokenStatus(api);
    await showTokenBalances(api);
  });

  // await mintToken(api, alice, 5000);

  await sendToken(api, alice, Bob, 2000);
}

async function showTokenStatus(api) {
  let now = await api.query.timestamp.now();
  let init = await api.query.token.init();
  let totalSupply = await api.query.token.totalSupply();
  let localSupply = await api.query.token.localSupply();

  console.log(`=== show token status ===`);
  console.log(`Timestamp: ${now}`);
  console.log(`Token init status: ${init}`);
  console.log(`Token total supply: ${totalSupply}`);
  console.log(`Token local supply: ${localSupply}`);
  console.log('');
}

async function showTokenBalances(api) {
  let balanceOf = {};
  balanceOf[Alice] = await api.query.token.balanceOf(Alice);
  balanceOf[Bob] = await api.query.token.balanceOf(Bob);

  console.log(`=== show token balances ===`);
  console.log(`Balance of Alice: ${balanceOf[Alice]}`);
  console.log(`Balance of Bob: ${balanceOf[Bob]}`);
  console.log('');
}

async function mintToken(api, owner, value) {
  const tx = api.tx.token.mint(value);
  const hash = await tx.signAndSend(owner);

  console.log('=== mint token ===');
  console.log(`Mint ${value} token with hash: ${hash.toHex()}`);
  console.log('');
}

async function sendToken(api, sender, receiver, value) {
  // Create a extrinsic, transferring tokens to the receiver
  const transfer = api.tx.token.transfer(receiver, value);
  // Sign and send the transaction using our account
  const hash = await transfer.signAndSend(sender);

  console.log('=== send token ===');
  console.log(`Transfer ${value} token sent with hash: ${hash.toHex()}`);
  console.log('');
}

// main().catch(console.error).finally(_ => process.exit());
main().catch(console.error);