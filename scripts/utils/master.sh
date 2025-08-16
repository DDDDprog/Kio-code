#!/bin/bash

# Kio Code Editor Master Script
# This script provides a menu for all available commands

set -e

echo "🎯 Kio Code Editor - Master Control Script"
echo "=========================================="

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

# Function to show menu
show_menu() {
    echo ""
    echo "Available commands:"
    echo ""
    echo "📦 Build & Setup:"
    echo "1) Install dependencies and setup environment"
    echo "2) Build application"
    echo "3) Build and package for distribution"
    echo ""
    echo "🚀 Development:"
    echo "4) Run in development mode"
    echo "5) Run in production mode"
    echo "6) Launch application"
    echo ""
    echo "🧹 Maintenance:"
    echo "7) Clean build artifacts"
    echo "8) Full clean (including node_modules)"
    echo "9) Show project status"
    echo ""
    echo "❌ Exit:"
    echo "0) Exit"
    echo ""
    read -p "Enter your choice (0-9): " choice
}

# Function to handle menu choice
handle_choice() {
    case $choice in
        1)
            print_status "Installing dependencies and setting up environment..."
            ./scripts/build/install.sh
            ;;
        2)
            print_status "Building application..."
            ./scripts/build/build.sh
            ;;
        3)
            print_status "Building and packaging for distribution..."
            ./scripts/build/build.sh --package
            ;;
        4)
            print_status "Starting development mode..."
            ./scripts/dev/run.sh --dev
            ;;
        5)
            print_status "Starting production mode..."
            ./scripts/dev/run.sh
            ;;
        6)
            print_status "Launching application..."
            ./scripts/dev/launcher.sh
            ;;
        7)
            print_status "Cleaning build artifacts..."
            ./scripts/utils/clean.sh
            ;;
        8)
            print_status "Performing full clean..."
            ./scripts/utils/clean.sh --full
            ;;
        9)
            print_status "Showing project status..."
            ./scripts/utils/status.sh
            ;;
        0)
            print_success "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please enter a number between 0 and 9."
            ;;
    esac
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Main loop
while true; do
    show_menu
    handle_choice
    
    if [ "$choice" != "0" ]; then
        echo ""
        read -p "Press Enter to continue..."
    fi
done
