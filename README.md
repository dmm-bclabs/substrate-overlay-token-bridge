# substrate-overlay-token-bridge

```
$ yarn install
$ yarn run dev
```

parent chain
```
$ ./target/release/substrate-overlay-token purge-chain --chain parent --base-path /tmp/parent
$ ./target/release/substrate-overlay-token --chain parent --charlie --validator --base-path /tmp/parent --ws-port 9944
```

child chain
```
$ ./target/release/substrate-overlay-token purge-chain --chain child --base-path /tmp/child
$ ./target/release/substrate-overlay-token --chain child --dave --validator --base-path /tmp/child --ws-port 9945
```