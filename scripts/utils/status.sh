#!/bin/bash

# Kio Code Editor - Status Script
# This script shows project information and system status

set -e

echo "📊 Kio Code Editor - Project Status"
echo "==================================="

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
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get file size in human readable format
human_readable_size() {
    local size=$1
    if [ $size -gt 1048576 ]; then
        echo "$(echo "scale=2; $size/1048576" | bc) MB"
    elif [ $size -gt 1024 ]; then
        echo "$(echo "scale=2; $size/1024" | bc) KB"
    else
        echo "${size} B"
    fi
}

echo ""
print_status "Project Information:"
echo "  Name: $(node -p "require('./package.json').name")"
echo "  Version: $(node -p "require('./package.json').version")"
echo "  Description: $(node -p "require('./package.json').description")"
echo "  Author: $(node -p "require('./package.json').author")"

echo ""
print_status "System Information:"
echo "  Platform: $(uname -s) $(uname -m)"
echo "  Kernel: $(uname -r)"
echo "  Shell: $SHELL"

echo ""
print_status "Development Environment:"
if command_exists node; then
    echo "  Node.js: $(node --version)"
else
    print_error "  Node.js: Not installed"
fi

if command_exists yarn; then
    echo "  Yarn: $(yarn --version)"
else
    print_warning "  Yarn: Not installed"
fi

if command_exists npm; then
    echo "  npm: $(npm --version)"
else
    print_warning "  npm: Not installed"
fi

if command_exists git; then
    echo "  Git: $(git --version)"
    if [ -d ".git" ]; then
        echo "  Git Branch: $(git branch --show-current)"
        echo "  Git Commit: $(git rev-parse --short HEAD)"
    fi
else
    print_warning "  Git: Not installed"
fi

echo ""
print_status "Project Structure:"
if [ -d "node_modules" ]; then
    NODE_MODULES_SIZE=$(du -s node_modules | cut -f1)
    echo "  node_modules: $(human_readable_size $NODE_MODULES_SIZE)"
else
    print_warning "  node_modules: Not installed"
fi

if [ -d "out" ]; then
    OUT_SIZE=$(du -s out | cut -f1)
    echo "  build output: $(human_readable_size $OUT_SIZE)"
else
    print_warning "  build output: Not built"
fi

if [ -d "src" ]; then
    SRC_SIZE=$(du -s src | cut -f1)
    echo "  source code: $(human_readable_size $SRC_SIZE)"
fi

echo ""
print_status "Build Status:"
if [ -d "out" ] && [ "$(ls -A out)" ]; then
    print_success "  Build: Available"
else
    print_warning "  Build: Not available (run build script)"
fi

if [ -d "release" ] && [ "$(ls -A release)" ]; then
    print_success "  Packages: Available"
else
    print_warning "  Packages: Not available (run build with --package)"
fi

echo ""
print_status "Scripts Available:"
echo "  Build: ./scripts/build/build.sh"
echo "  Install: ./scripts/build/install.sh"
echo "  Run Dev: ./scripts/dev/run.sh --dev"
echo "  Run Prod: ./scripts/dev/run.sh"
echo "  Launcher: ./scripts/dev/launcher.sh"
echo "  Master: ./scripts/utils/master.sh"
echo "  Clean: ./scripts/utils/clean.sh"

echo ""
print_success "Status check completed!"
