#!/bin/bash

set -e

echo "==> Ensure mobile node_modules exists"
mkdir -p packages/mobile/node_modules

echo "==> Copying react-native to mobile node_modules"
cp -R node_modules/react-native packages/mobile/node_modules/

echo "==> Copying @react-native-community/cli-platform-ios to mobile node_modules"
mkdir -p packages/mobile/node_modules/@react-native-community
cp -R node_modules/@react-native-community/cli-platform-ios packages/mobile/node_modules/@react-native-community/

echo "==> Checking for react_native_pods"
if [ -f packages/mobile/node_modules/react-native/scripts/react_native_pods ]; then
  echo "✅ Found react_native_pods"
else
  echo "❌ react_native_pods NOT FOUND"
fi

echo "==> Checking for cli-platform-ios/native_modules"
if [ -d packages/mobile/node_modules/@react-native-community/cli-platform-ios/native_modules ]; then
  echo "✅ Found cli-platform-ios/native_modules"
else
  echo "❌ cli-platform-ios/native_modules NOT FOUND"
fi

echo "==> If both files are found, you can now run:"
echo "cd packages/mobile/ios && pod install"
