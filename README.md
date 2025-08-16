# 🎯 Kio - Advanced Electron Code Editor - Create By Dipanjan Dhar

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- Yarn (recommended) or npm
- Git (optional but recommended)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd kio
   ```

2. **Install dependencies and setup**

   ```bash
   ./scripts/build/install.sh
   ```

3. **Build the application**

   ```bash
   ./scripts/build/build.sh
   ```

4. **Run the application**
   ```bash
   ./scripts/dev/run.sh
   ```

## 📁 Project Structure

```
kio/
├── scripts/                 # Build and utility scripts
│   ├── build/              # Build and installation scripts
│   │   ├── install.sh      # Setup development environment
│   │   └── build.sh        # Build application
│   ├── dev/                # Development scripts
│   │   ├── run.sh          # Run development server
│   │   └── launcher.sh     # Application launcher
│   └── utils/              # Utility scripts
│       ├── master.sh       # Interactive menu
│       ├── clean.sh        # Clean build artifacts
│       └── status.sh       # Show project status
├── src/                    # Source code
│   ├── main/              # Electron main process
│   ├── renderer/          # React renderer process
│   └── preload/           # Preload scripts
├── build/                 # Build configuration
├── resources/             # Application resources
└── package.json          # Project configuration
```

## 🛠️ Development

### Available Scripts

| Script                               | Description                                |
| ------------------------------------ | ------------------------------------------ |
| `./kio.sh`                           | Main launcher with interactive menu        |
| `./scripts/utils/master.sh`          | Interactive menu for all commands          |
| `./scripts/build/install.sh`         | Install dependencies and setup environment |
| `./scripts/build/build.sh`           | Build the application                      |
| `./scripts/build/build.sh --package` | Build and create distributable packages    |
| `./scripts/dev/run.sh --dev`         | Run in development mode                    |
| `./scripts/dev/run.sh`               | Run in production mode                     |
| `./scripts/utils/clean.sh`           | Clean build artifacts                      |
| `./scripts/utils/status.sh`          | Show project status                        |

### Development Workflow

1. **Start development**

   ```bash
   ./scripts/dev/run.sh --dev
   ```

2. **Build for production**

   ```bash
   ./scripts/build/build.sh
   ```

3. **Create distributable packages**

   ```bash
   ./scripts/build/build.sh --package
   ```

4. **Clean build artifacts**
   ```bash
   ./scripts/utils/clean.sh
   ```

## 🎨 Customization

### Themes

The editor supports multiple themes. You can customize the theme in the settings:

- `vs-dark` (default) - Dark theme
- `vs-light` - Light theme
- `hc-black` - High contrast black
- `hc-white` - High contrast white

### Settings

The application stores settings in the user's configuration directory. You can modify:

- Font size and family
- Tab size and indentation
- Word wrap settings
- Minimap visibility
- Auto-save preferences

## 🔧 Build Configuration

The build process is configured through:

- `package.json` - Dependencies and basic configuration
- `electron-builder.yml` - Electron Builder configuration
- `electron.vite.config.ts` - Vite configuration
- `build/config/build-config.json` - Build settings

## 📦 Distribution

### Creating Packages

The application can be packaged for different platforms:

```bash
# For Linux
./scripts/build/build.sh --package

# For macOS
./scripts/build/build.sh --package

# For Windows
./scripts/build/build.sh --package
```

### Package Types

- **Linux**: AppImage, .deb, .rpm
- **macOS**: .dmg, .zip
- **Windows**: .exe (NSIS), portable

## 🐛 Troubleshooting

### Common Issues

1. **Node.js version too old**
   - Ensure you have Node.js 18 or higher installed
   - Run `node --version` to check

2. **Dependencies not found**
   - Run `./scripts/build/install.sh` to reinstall dependencies

3. **Build fails**
   - Clean build artifacts: `./scripts/utils/clean.sh`
   - Rebuild: `./scripts/build/build.sh`

4. **Permission denied**
   - Make scripts executable: `chmod +x scripts/**/*.sh`

### Getting Help

- Check the project status: `./scripts/utils/status.sh`
- Review build logs in `build/logs/`
- Check the console output for error messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all scripts work on all platforms

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Electron](https://electronjs.org/) - Cross-platform desktop app framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor component
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Vite](https://vitejs.dev/) - Build tool

---

**Made with ❤️ for developers**
