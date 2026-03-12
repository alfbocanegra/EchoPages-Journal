#!/bin/bash
echo "🤖 Starting Android Tests..."
if [ -n "$ANDROID_HOME" ]; then
    $ANDROID_HOME/emulator/emulator -avd Pixel_3a_API_34_extension_level_7_arm64-v8a &
    sleep 10
    cd packages/mobile
    npx react-native run-android
else
    echo "Android SDK not found. Please set ANDROID_HOME environment variable."
    exit 1
fi
