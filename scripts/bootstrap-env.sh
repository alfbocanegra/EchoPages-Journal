#!/bin/bash

# EchoPages Journal Development Environment Bootstrap Script
# This script sets up the development environment following 2025 guidelines

set -e

echo "🚀 EchoPages Journal Development Environment Setup"
echo "=================================================="

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

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS. Please use the appropriate script for your platform."
    exit 1
fi

print_status "Detected macOS $(sw_vers -productVersion)"

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    print_error "Homebrew is not installed. Please install Homebrew first:"
    echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

print_success "Homebrew is installed"

# Install Podman
print_status "Installing Podman..."
if ! command -v podman &> /dev/null; then
    brew install podman
    print_success "Podman installed"
else
    print_success "Podman already installed"
fi

# Initialize and start Podman machine
print_status "Setting up Podman machine..."
if ! podman machine list | grep -q "podman-machine-default"; then
    podman machine init
    print_success "Podman machine initialized"
fi

if ! podman machine list | grep -q "Running"; then
    podman machine start
    print_success "Podman machine started"
else
    print_success "Podman machine already running"
fi

# Install Node.js
print_status "Installing Node.js..."
if ! command -v node &> /dev/null; then
    brew install node
    print_success "Node.js installed"
else
    print_success "Node.js already installed: $(node --version)"
fi

# Install Yarn
print_status "Installing Yarn..."
if ! command -v yarn &> /dev/null; then
    npm install -g yarn
    print_success "Yarn installed"
else
    print_success "Yarn already installed: $(yarn --version)"
fi

# Install VS Code if not present
print_status "Checking VS Code installation..."
if ! command -v code &> /dev/null; then
    print_warning "VS Code not found in PATH. Please install VS Code manually:"
    echo "  https://code.visualstudio.com/download"
    echo "  After installation, install the 'Remote - Containers' extension"
else
    print_success "VS Code found"
fi

# Install project dependencies
print_status "Installing project dependencies..."
cd "$(dirname "$0")/.."

# Install root dependencies
if [ -f "package.json" ]; then
    yarn install
    print_success "Root dependencies installed"
fi

# Install package dependencies
for package in packages/*/; do
    if [ -f "${package}package.json" ]; then
        print_status "Installing dependencies for $(basename "$package")..."
        cd "$package"
        yarn install
        cd - > /dev/null
        print_success "Dependencies installed for $(basename "$package")"
    fi
done

# Install backend dependencies
if [ -f "backend/package.json" ]; then
    print_status "Installing backend dependencies..."
    cd backend
    yarn install
    cd - > /dev/null
    print_success "Backend dependencies installed"
fi

# Create environment validation script
print_status "Creating environment validation script..."
cat > scripts/validate-env.sh << 'EOF'
#!/bin/bash

echo "🔍 Validating EchoPages Journal Development Environment"
echo "======================================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1: $(command -v "$1")"
        return 0
    else
        echo -e "${RED}✗${NC} $1: Not found"
        return 1
    fi
}

check_version() {
    if command -v "$1" &> /dev/null; then
        version=$($1 --version 2>/dev/null || echo "Unknown")
        echo -e "${GREEN}✓${NC} $1: $version"
        return 0
    else
        echo -e "${RED}✗${NC} $1: Not found"
        return 1
    fi
}

echo "Checking required tools:"
check_command "node"
check_command "npm"
check_command "yarn"
check_command "podman"
check_command "git"

echo -e "\nChecking versions:"
check_version "node"
check_version "npm"
check_version "yarn"
check_version "podman"

echo -e "\nChecking Podman machine:"
if podman machine list | grep -q "Running"; then
    echo -e "${GREEN}✓${NC} Podman machine is running"
else
    echo -e "${RED}✗${NC} Podman machine is not running"
fi

echo -e "\nChecking VS Code extensions:"
if command -v code &> /dev/null; then
    if code --list-extensions | grep -q "ms-vscode-remote.remote-containers"; then
        echo -e "${GREEN}✓${NC} Remote - Containers extension installed"
    else
        echo -e "${YELLOW}!${NC} Remote - Containers extension not installed"
        echo "  Please install: code --install-extension ms-vscode-remote.remote-containers"
    fi
else
    echo -e "${YELLOW}!${NC} VS Code not found in PATH"
fi

echo -e "\nEnvironment validation complete!"
EOF

chmod +x scripts/validate-env.sh
print_success "Environment validation script created"

# Create development workflow script
print_status "Creating development workflow script..."
cat > scripts/dev-workflow.sh << 'EOF'
#!/bin/bash

# EchoPages Journal Development Workflow
# Quick commands for common development tasks

set -e

echo "🛠️  EchoPages Journal Development Workflow"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

show_menu() {
    echo -e "${BLUE}Available commands:${NC}"
    echo "1. Start backend development server"
    echo "2. Start web development server"
    echo "3. Start mobile development server"
    echo "4. Start desktop development server"
    echo "5. Run all tests"
    echo "6. Build all packages"
    echo "7. Validate environment"
    echo "8. Open VS Code in container"
    echo "9. Exit"
    echo
}

run_backend() {
    echo "Starting backend development server..."
    cd backend
    yarn dev
}

run_web() {
    echo "Starting web development server..."
    cd packages/web
    yarn dev
}

run_mobile() {
    echo "Starting mobile development server..."
    cd packages/mobile
    yarn start
}

run_desktop() {
    echo "Starting desktop development server..."
    cd packages/desktop
    yarn dev
}

run_tests() {
    echo "Running all tests..."
    yarn test
}

run_build() {
    echo "Building all packages..."
    yarn build
}

validate_env() {
    echo "Validating environment..."
    ./scripts/validate-env.sh
}

open_vscode() {
    echo "Opening VS Code in container..."
    code --remote-container-command /bin/bash
}

while true; do
    show_menu
    read -p "Select an option (1-9): " choice
    
    case $choice in
        1) run_backend ;;
        2) run_web ;;
        3) run_mobile ;;
        4) run_desktop ;;
        5) run_tests ;;
        6) run_build ;;
        7) validate_env ;;
        8) open_vscode ;;
        9) echo "Goodbye!"; exit 0 ;;
        *) echo "Invalid option. Please try again." ;;
    esac
    
    echo
    read -p "Press Enter to continue..."
    clear
done
EOF

chmod +x scripts/dev-workflow.sh
print_success "Development workflow script created"

print_success "🎉 Environment setup complete!"
echo
echo "Next steps:"
echo "1. Run './scripts/validate-env.sh' to verify the setup"
echo "2. Run './scripts/dev-workflow.sh' for development commands"
echo "3. Open VS Code and install the 'Remote - Containers' extension"
echo "4. Use 'Reopen in Container' to start development in the containerized environment"
echo
echo "Happy coding! 🚀" 