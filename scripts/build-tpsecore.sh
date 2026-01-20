git pull --recurse-submodules # ensure tpsecore is pulled in

# install rust, wasmpack, and related
curl https://sh.rustup.rs -sSf | sh -s -- -y
rustup default 1.64.0
source "$HOME/.cargo/env"
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | bash

# build it
git submodule init
git submodule update
cd tpsecore
ls
mkdir -p ../target
CARGO_TARGET_DIR="../target" wasm-pack build --target web #--profile release
cp pkg/tpsecore_bg.wasm pkg/tpsecore.js ../source/lib
cd ..