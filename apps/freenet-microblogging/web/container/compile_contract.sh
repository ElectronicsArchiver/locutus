#!/usr/bin/bash
cargo build --release --target wasm32-unknown-unknown && \
	cp $CARGO_TARGET_DIR/wasm32-unknown-unknown/release/freenet_microblogging_web.wasm ./freenet_microblogging_web.wasm 
cargo build --release --target wasm32-wasi && \
	cp $CARGO_TARGET_DIR/wasm32-wasi/release/freenet_microblogging_web.wasm ./freenet_microblogging_web.wasi.wasm 
echo "Compiled using module memory" 
