# substrate-overlay-token-bridge

```
$ yarn install
$ yarn run dev
```

parent chain
```
$ ./target/release/substrate-overlay-token purge-chain --dev --base-path /tmp/parent
$ ./target/release/substrate-overlay-token --dev --base-path /tmp/parent --ws-port 9944 --in-peer 0
$ ./target/release/substrate-overlay-token --dev --rpc-port 8888 --ws-port 9944 --in-peer 0
```

child chain
```
$ ./target/release/substrate-overlay-token purge-chain --dev --base-path /tmp/child
$ ./target/release/substrate-overlay-token --dev --base-path /tmp/child --ws-port 9945 --in-peer 0

$ ./target/release/substrate-overlay-token --chain dev2spec-raw.json --alice --validator --ws-port 9945 --base-path /tmp/alice2 --in-peers 0
```