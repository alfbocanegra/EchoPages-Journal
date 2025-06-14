#!/bin/bash

set -e

echo "==> Moving to project root"
cd /Users/lbocanegra/Documents/GitHub/EchoPages-Journal

echo "==> Removing all yarn.lock and package-lock.json files"
find . -name "yarn.lock" -type f -delete
find . -name "package-lock.json" -type f -delete

echo "==> Removing all node_modules folders"
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

echo "==> Installing dependencies with npm (using npm workspaces)"
npm install

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
