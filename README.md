# substrate-overlay-token-bridge

```
$ yarn install
$ yarn run dev
```

parent chain
```
$ ./target/release/substrate-overlay-token purge-chain --dev --base-path /tmp/parent
$ ./target/release/substrate-overlay-token --dev --base-path /tmp/parent --ws-port 9944 --in-peers 0
```

child chain
```
$ ./target/release/substrate-overlay-token purge-chain --dev --base-path /tmp/child
$ ./target/release/substrate-overlay-token --dev --base-path /tmp/child --ws-port 9945 --in-peers 0
```