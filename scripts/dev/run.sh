#!/bin/bash

# Kio Code Editor Run Script
# This script starts the development server and runs the application

set -e

echo "🚀 Starting Kio Code Editor..."

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

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_warning "Dependencies not found. Installing..."
    yarn install
    print_success "Dependencies installed"
fi

# Check if build exists
if [ ! -d "out" ]; then
    print_warning "Build not found. Building application..."
    ./scripts/build/build.sh
    print_success "Application built"
fi

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down Kio Code Editor..."
    # Kill any background processes
    jobs -p | xargs -r kill
    print_success "Kio Code Editor stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if we should run in development mode
if [ "$1" = "--dev" ]; then
    print_status "Starting in development mode..."
    print_status "Press Ctrl+C to stop the application"
    
    # Run the development server with sandbox disabled
    ELECTRON_DISABLE_SANDBOX=true npx electron-vite dev
else
    print_status "Starting in production mode..."
    print_status "Press Ctrl+C to stop the application"
    
    # Run the production build with sandbox disabled
    ELECTRON_DISABLE_SANDBOX=true npx electron-vite preview
fi

# This line will only be reached if the application exits normally
print_success "Kio Code Editor exited normally"
