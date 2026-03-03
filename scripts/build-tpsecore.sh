git pull --recurse-submodules # ensure tpsecore is pulled in

# install rust
curl https://sh.rustup.rs -sSf | sh -s -- -y
source "$HOME/.cargo/env"
rustup default 1.87.0
rustup target add wasm32-unknown-unknown

# build it
git submodule init
git submodule update
cd tpsecore
cargo build --profile release
cp target/wasm32-unknown-unknown/release/tpsecore.wasm ../source/lib
cd ..