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