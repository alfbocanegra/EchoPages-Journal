#!/bin/bash

set -e

echo "==> Moving to project root"
cd /Users/lbocanegra/Documents/GitHub/EchoPages-Journal

echo "==> Cleaning all node_modules and lockfiles"
rm -rf node_modules packages/mobile/node_modules yarn.lock package-lock.json

echo "==> Installing dependencies with Yarn (monorepo root)"
yarn install

echo "==> Checking for react_native_pods"
if [ -f packages/mobile/node_modules/react-native/scripts/react_native_pods ]; then
  echo "✅ Found react_native_pods"
else
  echo "❌ react_native_pods NOT FOUND"
fi

echo "==> Checking for cli-platform-ios/native_modules"
if [ -f packages/mobile/node_modules/@react-native-community/cli-platform-ios/native_modules ]; then
  echo "✅ Found cli-platform-ios/native_modules"
else
  echo "❌ cli-platform-ios/native_modules NOT FOUND"
fi

echo "==> If both files are found, you can now run:"
echo "cd packages/mobile/ios && pod install"
