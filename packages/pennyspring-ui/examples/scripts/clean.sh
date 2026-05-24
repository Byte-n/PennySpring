#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEEP_CLEAN=false

if [ "${1:-}" = "--deep" ]; then
  DEEP_CLEAN=true
fi

echo "=== Cleaning Android ==="
if [ -d "$ROOT_DIR/android" ]; then
  cd "$ROOT_DIR/android"
  ./gradlew clean 2>/dev/null || true
  rm -rf app/.cxx .cxx .gradle app/build build
  echo "Android & C++ Cache cleaned."
fi

echo "=== Cleaning iOS ==="
if [ -d "$ROOT_DIR/ios" ]; then
  rm -rf "$ROOT_DIR/ios/build" "$ROOT_DIR/ios/Pods" "$ROOT_DIR/ios/Podfile.lock"
  if [ "$DEEP_CLEAN" = true ]; then
    rm -rf "$HOME/Library/Developer/Xcode/DerivedData"/*
    echo "Xcode DerivedData cleaned."
  fi
  echo "iOS cleaned."
fi

echo "=== Cleaning Metro cache ==="
rm -rf /tmp/metro-* /tmp/haste-map-*
watchman watch-del-all 2>/dev/null || true
echo "Metro cache cleaned."

echo "=== Cleaning node_modules ==="
rm -rf "$ROOT_DIR/node_modules"
echo "node_modules cleaned."

echo "=== Reinstalling dependencies ==="
cd "$ROOT_DIR/../../.." && yarn install

echo "=== Done ==="
