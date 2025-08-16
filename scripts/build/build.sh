#!/bin/bash

# Kio Code Editor Build Script
# This script builds and packages the Kio code editor

set -e

echo "🚀 Starting Kio Code Editor build process..."

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

# Function to run commands
run_command() {
    local cmd="$1"
    local description="$2"
    
    print_status "$description..."
    if eval "$cmd"; then
        print_success "$description completed"
    else
        print_error "$description failed"
        exit 1
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js version: $(node --version)"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    run_command "yarn install" "Installing dependencies"
else
    print_status "Dependencies already installed"
fi

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf out dist release

# Format code
run_command "npx prettier --write ." "Formatting code"

# Lint code
run_command "npx eslint --cache ." "Linting code"

# Type checking
print_status "Running type checks..."
run_command "npx tsc --noEmit -p tsconfig.node.json --composite false" "Node type checking"
run_command "npx tsc --noEmit -p tsconfig.web.json --composite false" "Web type checking"
print_success "Type checks passed"

# Build the application
run_command "npx electron-vite build" "Building application"

# Create build info
BUILD_DATE=$(date '+%Y-%m-%d %H:%M:%S')
BUILD_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_VERSION=$(node -p "require('./package.json').version")

echo "Build completed at: $BUILD_DATE" > build/build-info.txt
echo "Git commit: $BUILD_COMMIT" >> build/build-info.txt
echo "Version: $BUILD_VERSION" >> build/build-info.txt

print_success "Build completed successfully!"
print_status "Build info saved to build/build-info.txt"

# Optional: Create distributable packages
if [ "$1" = "--package" ]; then
    print_status "Creating distributable packages..."
    
    # Detect platform
    PLATFORM=$(uname -s)
    case "$PLATFORM" in
        Linux*)
            print_status "Building for Linux..."
            run_command "npx electron-vite build && npx electron-builder --linux" "Building Linux package"
            ;;
        Darwin*)
            print_status "Building for macOS..."
            run_command "npx electron-vite build && npx electron-builder --mac" "Building macOS package"
            ;;
        MINGW*|MSYS*|CYGWIN*)
            print_status "Building for Windows..."
            run_command "npx electron-vite build && npx electron-builder --win" "Building Windows package"
            ;;
        *)
            print_warning "Unknown platform: $PLATFORM"
            print_status "Building unpacked version..."
            run_command "npx electron-vite build && npx electron-builder --dir" "Building unpacked version"
            ;;
    esac
    
    print_success "Packages created successfully!"
fi

print_success "🎉 Build process completed!"
print_status "You can now run the application with: npx electron-vite preview"
