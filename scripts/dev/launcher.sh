#!/bin/bash
# Kio Code Editor Launcher
# This script launches the Kio code editor

cd "$(dirname "$0")/../.."

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    yarn install
fi

if [ ! -d "out" ]; then
    echo "Building application..."
    ./scripts/build/build.sh
fi

echo "Starting Kio Code Editor..."
npx electron-vite preview
