// Import the API, Keyring and some utility functions
const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');

// Known account we want to use (available on dev chain, with funds)
const Alice = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
const Bob = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';

const customTypes = {
  TokenBalance: "u128",
  ChildChainId: "u32"
};

async function main () {
  const parent = process.env.PARENT || 'ws://127.0.0.1:9944';
  const child = process.env.CHILD || 'ws://127.0.0.1:9945';
  const parentApi = await ApiPromise.create({
    provider: new WsProvider(parent),
    types: customTypes
  });
  const childApi = await ApiPromise.create({
    provider: new WsProvider(child),
    types: customTypes
  });

  // Constuct the keying after the API (crypto has an async init)
  const keyring = new Keyring({ type: 'sr25519' });
  // Add alice to our keyring with a hard-deived path (empty phrase, so uses dev)
  const alice = keyring.addFromUri('//Alice');

  var initStatus = {
    parent: false,
    child: false
  };

  console.log(`Parent: ${parent}`);
  await showTokenStatus(parentApi);
  console.log(`Child: ${child}`);
  await showTokenStatus(childApi);

  parentApi.query.token.init(async (parentInit) => {
    let childInit = await childApi.query.token.init();
    if (parentInit.valueOf() && childInit.valueOf()) {
      syncTokenStatus(parentApi, childApi, alice);
    }
  })

  childApi.query.token.init(async (childInit) => {
    let parentInit = await parentApi.query.token.init();
    if (parentInit.valueOf() && childInit.valueOf()) {
      syncTokenStatus(parentApi, childApi, alice);
    }
  })
}

function syncTokenStatus(parentApi, childApi, owner) {
  syncTokenStatus = function() {};
  console.log("watch start");

  // watch parent
  parentApi.query.system.events((events) => {
    // loop through the Vec<EventRecord>
    events.forEach((record) => {
      // extract the phase, event and the event types
      const { event, phase } = record;
      const types = event.typeDef;

      switch(`${event.section}:${event.method}`) {
        case 'token:Minted':
          console.log('Parent: Mint');
          console.log(`Amount: ${event.data[0]}`);
          mintToken(childApi, owner, event.data[0]);
          break;
        case 'token:Burned':
          console.log('Parent: Burn');
          console.log(`Amount: ${event.data[0]}`);
          burnToken(childApi, owner, event.data[0]);
          break;
        case 'token:SentToChild':
          console.log('Parent: SentToChild');
          console.log(`ChildId: ${event.data[0]}`);
          console.log(`Address: ${event.data[1]}`);
          console.log(`Amount: ${event.data[2]}`);
          receiveFromParent(childApi, owner, event.data[2]);
          break;
      default:
        break;
      }
    });
  });

  // watch child
  childApi.query.system.events((events) => {
    // loop through the Vec<EventRecord>
    events.forEach((record) => {
      // extract the phase, event and the event types
      const { event, phase } = record;
      const types = event.typeDef;

      switch(`${event.section}:${event.method}`) {
        case 'token:SentToParent':
          console.log('Child: SentToParent');
          console.log(`Address: ${event.data[0]}`);
          console.log(`Amount: ${event.data[1]}`);
          receiveFromChild(parentApi, owner, event.data[1]);
          break;
      default:
        break;
      }
    });
  });
}

async function showTokenStatus(api) {
  let now = await api.query.timestamp.now();
  let init = await api.query.token.init();
  let totalSupply = await api.query.token.totalSupply();
  let localSupply = await api.query.token.localSupply();
  let owner = await api.query.token.owner();
  let parentSupply = await api.query.token.parentSupply();

  console.log(`=== show token status ===`);
  console.log(`Timestamp: ${now}`);
  console.log(`Token init status: ${init}`);
  console.log(`Token total supply: ${totalSupply}`);
  console.log(`Token local supply: ${localSupply}`);
  console.log(`Token parent supply: ${parentSupply}`);
  console.log(`Token owner: ${owner}`);
  console.log('');
}

async function mintToken(api, owner, value) {
  const tx = api.tx.token.mint(value);
  const hash = await tx.signAndSend(owner);

  console.log('=== mint token ===');
  console.log(`Mint ${value} token with hash: ${hash.toHex()}`);
  console.log('');
}

async function burnToken(api, owner, value) {
  const tx = api.tx.token.burn(value);
  const hash = await tx.signAndSend(owner);

  console.log('=== burn token ===');
  console.log(`Burn ${value} token with hash: ${hash.toHex()}`);
  console.log('');
}

async function receiveFromParent(api, sender, value) {
  const tx = api.tx.token.receiveFromParent(value);
  const hash = await tx.signAndSend(sender);

  console.log('=== send receive from parent ===');
  console.log(`Receive ${value} token from parent with hash: ${hash.toHex()}`);
  console.log('');
}

async function receiveFromChild(api, sender, value) {
  const tx = api.tx.token.receiveFromChild(0, value);
  const hash = await tx.signAndSend(sender);

  console.log('=== send receive from child ===');
  console.log(`Receive ${value} token from child with hash: ${hash.toHex()}`);
  console.log('');
}

// main().catch(console.error).finally(_ => process.exit());
main().catch(console.error);
