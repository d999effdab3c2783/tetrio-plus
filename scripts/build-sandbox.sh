#!/bin/bash
# A script for local building.
# todo: build tpsecore
# Run as ./scripts/build-sandbox.sh
rm -rf /tmp/tetrio-plus-build
mkdir /tmp/tetrio-plus-build
cp -r . /tmp/tetrio-plus-build

if [ ! -f 'TETR.IO Setup.tar.gz' ]; then
  wget -q -N https://tetr.io/about/desktop/builds/9/TETR.IO%20Setup.tar.gz
fi
firejail --private=/tmp/tetrio-plus-build bash ./scripts/pack-electron.sh
#firejail --private=/tmp/tetrio-plus-build bash ./scripts/pack-firefox.sh

sha256sum /tmp/tetrio-plus-build/{app.asar,tetrioplus.xpi}
ls -lh /tmp/tetrio-plus-build/{app.asar,tetrioplus.xpi}
