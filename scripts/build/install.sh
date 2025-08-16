#!/bin/bash

# Kio Code Editor Installation Script
# This script sets up the development environment for Kio

set -e

echo "🔧 Setting up Kio Code Editor development environment..."

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Checking system requirements..."

# Check Node.js
if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    print_status "Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18 or higher is required. Current version: $(node --version)"
    print_status "Please upgrade Node.js: https://nodejs.org/"
    exit 1
fi

print_success "Node.js version: $(node --version)"

# Check npm/yarn
if command_exists yarn; then
    PACKAGE_MANAGER="yarn"
    print_success "Using Yarn package manager"
elif command_exists npm; then
    PACKAGE_MANAGER="npm"
    print_warning "Using npm package manager (Yarn recommended)"
else
    print_error "Neither npm nor yarn is installed."
    print_status "Installing Yarn..."
    npm install -g yarn
    PACKAGE_MANAGER="yarn"
    print_success "Yarn installed"
fi

# Check Git
if ! command_exists git; then
    print_warning "Git is not installed. Some features may not work properly."
else
    print_success "Git version: $(git --version)"
fi

# Create necessary directories
print_status "Creating build directories..."
mkdir -p build/logs
mkdir -p build/artifacts
mkdir -p build/config

# Make scripts executable
print_status "Making scripts executable..."
chmod +x scripts/**/*.sh

# Install dependencies
print_status "Installing dependencies..."
$PACKAGE_MANAGER install

# Install additional development tools
print_status "Installing development tools..."
if [ "$PACKAGE_MANAGER" = "yarn" ]; then
    yarn add -D @types/node typescript
else
    npm install --save-dev @types/node typescript
fi

# Create configuration files
print_status "Creating configuration files..."

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cat > .env << EOF
# Kio Code Editor Environment Variables
NODE_ENV=development
ELECTRON_IS_DEV=true
ELECTRON_RENDERER_URL=http://localhost:5173
EOF
    print_success "Created .env file"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
out/
dist/
release/
build/artifacts/
build/logs/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Electron
app/
packages/
EOF
    print_success "Created .gitignore file"
fi

# Create README for scripts folder
cat > scripts/README.md << EOF
# Kio Code Editor - Scripts Directory

This directory contains all the build and utility scripts for the Kio Code Editor.

## Directory Structure

- \`build/\` - Build and installation scripts
- \`dev/\` - Development and runtime scripts
- \`utils/\` - Utility and maintenance scripts

## Available Scripts

### Build Scripts (\`build/\`)
- \`install.sh\` - Sets up the development environment
- \`build.sh\` - Builds the application

### Development Scripts (\`dev/\`)
- \`run.sh\` - Runs the development server
- \`launcher.sh\` - Launches the application

### Utility Scripts (\`utils/\`)
- \`master.sh\` - Master control script with menu
- \`clean.sh\` - Cleans build artifacts
- \`status.sh\` - Shows project status

## Usage

### Quick Start
\`\`\`bash
# Use the master script for easy navigation
./scripts/utils/master.sh
\`\`\`

### Individual Commands
\`\`\`bash
# Install and setup
./scripts/build/install.sh

# Build application
./scripts/build/build.sh

# Run in development mode
./scripts/dev/run.sh --dev

# Run in production mode
./scripts/dev/run.sh

# Clean build artifacts
./scripts/utils/clean.sh

# Show project status
./scripts/utils/status.sh
\`\`\`
EOF

print_success "Created scripts documentation"

print_success "🎉 Installation completed successfully!"
print_status "You can now:"
print_status "  - Use master script: ./scripts/utils/master.sh"
print_status "  - Build: ./scripts/build/build.sh"
print_status "  - Develop: ./scripts/dev/run.sh --dev"
