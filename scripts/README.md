# Kio Code Editor - Scripts Directory

This directory contains all the build and utility scripts for the Kio Code Editor.

## Directory Structure

- `build/` - Build and installation scripts
- `dev/` - Development and runtime scripts
- `utils/` - Utility and maintenance scripts

## Available Scripts

### Build Scripts (`build/`)

- `install.sh` - Sets up the development environment
- `build.sh` - Builds the application

### Development Scripts (`dev/`)

- `run.sh` - Runs the development server
- `launcher.sh` - Launches the application

### Utility Scripts (`utils/`)

- `master.sh` - Master control script with menu
- `clean.sh` - Cleans build artifacts
- `status.sh` - Shows project status

## Usage

### Quick Start

```bash
# Use the master script for easy navigation
./scripts/utils/master.sh
```

### Individual Commands

```bash
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
```
