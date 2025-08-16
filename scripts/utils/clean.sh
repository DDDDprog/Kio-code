#!/bin/bash

# Kio Code Editor - Clean Script
# This script cleans build artifacts and temporary files

set -e

echo "🧹 Cleaning Kio Code Editor..."

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

# Function to clean directories
clean_directory() {
    local dir="$1"
    local description="$2"
    
    if [ -d "$dir" ]; then
        print_status "Cleaning $description..."
        rm -rf "$dir"/*
        print_success "$description cleaned"
    else
        print_warning "$description directory not found"
    fi
}

# Clean build artifacts
clean_directory "out" "build output"
clean_directory "dist" "distribution files"
clean_directory "release" "release packages"
clean_directory "build/artifacts" "build artifacts"
clean_directory "build/logs" "build logs"

# Clean node modules (optional)
if [ "$1" = "--full" ]; then
    print_warning "Performing full clean (including node_modules)..."
    if [ -d "node_modules" ]; then
        print_status "Removing node_modules..."
        rm -rf node_modules
        print_success "node_modules removed"
    fi
    
    if [ -f "yarn.lock" ]; then
        print_status "Removing yarn.lock..."
        rm yarn.lock
        print_success "yarn.lock removed"
    fi
fi

# Clean temporary files
print_status "Cleaning temporary files..."
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.log" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true

print_success "🧹 Clean completed successfully!"
