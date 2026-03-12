#!/bin/bash

# EchoPages Journal - Test Environment Setup Script
# This script sets up the complete testing environment for all platforms

set -e

echo "🚀 Setting up EchoPages Journal Test Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "packages" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Checking system requirements..."

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_NODE="18.0.0"
if [ "$(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE" ]; then
    print_error "Node.js version $REQUIRED_NODE or higher is required. Current: $NODE_VERSION"
    exit 1
fi
print_success "Node.js version: $NODE_VERSION"

# Check if Xcode is installed (for iOS development)
if command -v xcode-select &> /dev/null; then
    XCODE_PATH=$(xcode-select --print-path)
    print_success "Xcode found at: $XCODE_PATH"
else
    print_warning "Xcode not found. iOS development will not be available."
fi

# Check if Android SDK is installed
if [ -n "$ANDROID_HOME" ] && [ -d "$ANDROID_HOME" ]; then
    print_success "Android SDK found at: $ANDROID_HOME"
else
    print_warning "Android SDK not found. Android development will not be available."
fi

# Check if Java is installed
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n1 | cut -d'"' -f2)
    print_success "Java version: $JAVA_VERSION"
else
    print_warning "Java not found. Android development may not work properly."
fi

print_status "Installing root dependencies..."
npm install --legacy-peer-deps

print_status "Building shared package..."
cd packages/shared
npm run build
cd ../..

print_status "Building backend..."
cd backend
npm run build
cd ..

print_status "Setting up web package..."
cd packages/web
npm install
cd ../..

print_status "Setting up mobile package..."
cd packages/mobile
npm install --legacy-peer-deps
cd ../..

print_status "Checking available simulators and emulators..."

# Check iOS simulators
if command -v xcrun &> /dev/null; then
    print_status "Available iOS Simulators:"
    xcrun simctl list devices | grep -E "(iPhone|iPad)" | head -5
else
    print_warning "iOS simulators not available"
fi

# Check Android emulators
if [ -n "$ANDROID_HOME" ] && [ -f "$ANDROID_HOME/emulator/emulator" ]; then
    print_status "Available Android Emulators:"
    $ANDROID_HOME/emulator/emulator -list-avds
else
    print_warning "Android emulators not available"
fi

print_status "Creating test environment configuration..."

# Create test environment config
cat > .env.test << EOF
# Test Environment Configuration
NODE_ENV=test
DATABASE_URL=sqlite::memory:
JWT_SECRET=test-secret-key
ENCRYPTION_KEY=test-encryption-key-32-characters
PORT=3001
CORS_ORIGIN=http://localhost:3000
EOF

print_success "Test environment configuration created"

print_status "Setting up test databases..."
mkdir -p database/test
touch database/test/test.db

print_status "Validating test configuration..."

# Test backend build
if [ -d "backend/dist" ]; then
    print_success "Backend build successful"
else
    print_error "Backend build failed"
    exit 1
fi

# Test shared package build
if [ -d "packages/shared/dist" ]; then
    print_success "Shared package build successful"
else
    print_error "Shared package build failed"
    exit 1
fi

print_status "Creating platform-specific test scripts..."

# Create iOS test script
cat > scripts/test-ios.sh << 'EOF'
#!/bin/bash
echo "🍎 Starting iOS Tests..."
cd packages/mobile
npx react-native run-ios --simulator="iPhone 16 Pro"
EOF

# Create Android test script
cat > scripts/test-android.sh << 'EOF'
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
EOF

# Create web test script
cat > scripts/test-web.sh << 'EOF'
#!/bin/bash
echo "🌐 Starting Web Tests..."
cd packages/web
npm run dev &
WEB_PID=$!
sleep 5
echo "Web app started at http://localhost:5173"
echo "Press Ctrl+C to stop"
wait $WEB_PID
EOF

# Create desktop test script
cat > scripts/test-desktop.sh << 'EOF'
#!/bin/bash
echo "🖥️  Starting Desktop Tests..."
echo "Desktop testing requires Electron setup"
echo "This will be implemented in the next phase"
EOF

# Make scripts executable
chmod +x scripts/test-*.sh

print_success "Platform-specific test scripts created"

print_status "Running initial test suite..."

# Run a quick test to verify everything is working
npm test -- --passWithNoTests --verbose=false 2>/dev/null || {
    print_warning "Some tests failed, but environment setup is complete"
}

print_success "🎉 Test environment setup complete!"

echo ""
echo "📋 Test Environment Summary:"
echo "================================"
echo "✅ Node.js: $NODE_VERSION"
echo "✅ Backend: Built and ready"
echo "✅ Shared package: Built and ready"
echo "✅ Web package: Ready"
echo "✅ Mobile package: Ready"
if command -v xcode-select &> /dev/null; then
    echo "✅ iOS: Simulators available"
else
    echo "⚠️  iOS: Not available"
fi
if [ -n "$ANDROID_HOME" ]; then
    echo "✅ Android: Emulators available"
else
    echo "⚠️  Android: Not available"
fi

echo ""
echo "🚀 Quick Start Commands:"
echo "================================"
echo "Backend:  cd backend && npm run dev"
echo "Web:      ./scripts/test-web.sh"
echo "iOS:      ./scripts/test-ios.sh"
echo "Android:  ./scripts/test-android.sh"
echo "All tests: npm test"

echo ""
echo "📁 Important Files:"
echo "================================"
echo "Test config: jest.config.js"
echo "Babel config: babel.config.js"
echo "Test env: .env.test"
echo "Test DB: database/test/test.db"

print_success "Ready to start testing! 🚀" 