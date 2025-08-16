#!/bin/bash
# Kio Code Editor - Main Launcher
# This script provides easy access to all Kio commands

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🎯 Kio Code Editor${NC}"
echo "======================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if scripts directory exists
if [ ! -d "scripts" ]; then
    echo "Error: scripts directory not found. Please run the installation first."
    echo "Run: ./scripts/build/install.sh"
    exit 1
fi

# Show available commands
echo ""
echo -e "${BLUE}Available commands:${NC}"
echo "  ./scripts/utils/master.sh    - Interactive menu"
echo "  ./scripts/build/install.sh   - Install dependencies"
echo "  ./scripts/build/build.sh     - Build application"
echo "  ./scripts/dev/run.sh --dev   - Run in development mode"
echo "  ./scripts/dev/run.sh         - Run in production mode"
echo "  ./scripts/utils/clean.sh     - Clean build artifacts"
echo "  ./scripts/utils/status.sh    - Show project status"
echo ""

# If no arguments provided, show the master menu
if [ $# -eq 0 ]; then
    echo "Starting master menu..."
    ./scripts/utils/master.sh
else
    # Pass arguments to the master script
    ./scripts/utils/master.sh "$@"
fi
