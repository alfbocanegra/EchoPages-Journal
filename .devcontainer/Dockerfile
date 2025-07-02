FROM mcr.microsoft.com/devcontainers/javascript-node:18-bullseye

# Install additional development tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    nano \
    build-essential \
    python3 \
    python3-pip \
    sqlite3 \
    redis-tools \
    openjdk-11-jdk \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g \
    yarn \
    typescript \
    ts-node \
    nodemon \
    jest \
    @types/node \
    eslint \
    prettier \
    expo-cli \
    react-native-cli \
    electron \
    electron-builder

# Install React Native development tools
RUN npm install -g \
    @react-native-community/cli \
    @react-native-community/cli-platform-android \
    @react-native-community/cli-platform-ios

# Install Android SDK and platform tools
ENV ANDROID_SDK_ROOT=/opt/android-sdk
RUN mkdir -p $ANDROID_SDK_ROOT && \
    cd $ANDROID_SDK_ROOT && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip && \
    unzip cmdline-tools.zip && \
    rm cmdline-tools.zip && \
    mkdir -p cmdline-tools && \
    mv cmdline-tools/* cmdline-tools/latest && \
    yes | $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager --sdk_root=$ANDROID_SDK_ROOT --licenses && \
    $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager --sdk_root=$ANDROID_SDK_ROOT "platform-tools" "platforms;android-33" "build-tools;33.0.2" "emulator" "system-images;android-33;google_apis;x86_64"

ENV PATH="$PATH:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin"

# Install CocoaPods for iOS dependency management (not for building)
RUN apt-get update && apt-get install -y ruby-full && rm -rf /var/lib/apt/lists/*
RUN gem install cocoapods

# Set up environment
ENV NODE_ENV=development
ENV PATH="/usr/local/bin:${PATH}"

# Create workspace directory
WORKDIR /workspace

# Set default shell
SHELL ["/bin/bash", "-c"] 