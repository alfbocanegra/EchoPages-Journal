#!/bin/bash

set -e

# Move to the mobile package directory
echo "==> Moving to packages/mobile"
cd /Users/lbocanegra/Documents/GitHub/EchoPages-Journal/packages/mobile

# Scaffold a temporary React Native app to get a fresh android folder
echo "==> Creating a temporary React Native app to get a fresh android folder"
npx @react-native-community/cli init tempMobile --directory tempMobile

# Copy the android folder from tempMobile to mobile
echo "==> Copying android folder from tempMobile to mobile"
cp -R tempMobile/android .

# Clean up the temporary app
echo "==> Cleaning up temporary app"
rm -rf tempMobile

# Show the android folder structure
echo "==> Android folder structure after copy:"
ls -l android

echo "==> Android project is now set up. You can run:"
echo "cd /Users/lbocanegra/Documents/GitHub/EchoPages-Journal/packages/mobile"
echo "npx react-native run-android" 