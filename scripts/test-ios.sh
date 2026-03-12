#!/bin/bash
echo "🍎 Starting iOS Tests..."
cd packages/mobile
npx react-native run-ios --simulator="iPhone 16 Pro"
