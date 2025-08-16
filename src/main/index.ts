import { app, shell, BrowserWindow, ipcMain, dialog, Menu, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import Store from 'electron-store'
import * as fs from 'fs-extra'
import * as chokidar from 'chokidar'
import icon from '../../resources/icon.png?asset'

interface EditorSettings {
  theme: string
  fontSize: number
  fontFamily: string
  tabSize: number
  insertSpaces: boolean
  wordWrap: boolean
  minimap: boolean
  lineNumbers: boolean
  autoSave: boolean
  recentFiles: string[]
  workspace: string
  sidebarVisible: boolean
  statusBarVisible: boolean
  zenMode: boolean
}

class AdvancedEditor {
  private mainWindow: BrowserWindow | null = null
  private store: Store<EditorSettings>
  private fileWatchers: Map<string, chokidar.FSWatcher> = new Map()

  constructor() {
    this.store = new Store<EditorSettings>({
      defaults: {
        theme: 'vs-dark',
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        tabSize: 2,
        insertSpaces: true,
        wordWrap: false,
        minimap: true,
        lineNumbers: true,
        autoSave: true,
        recentFiles: [],
        workspace: '',
        sidebarVisible: true,
        statusBarVisible: true,
        zenMode: false
      }
    })

    this.initializeApp()
  }

  private initializeApp(): void {
    app.whenReady().then(() => {
      electronApp.setAppUserModelId('com.electron.kio')
      this.createWindow()
      this.setupMenu()
      this.setupIPC()
      this.setupGlobalShortcuts()
      this.setupFileWatchers()

      app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
      })

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow()
        }
      })
    })

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
  }

  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 800,
      minHeight: 600,
      show: false,
      autoHideMenuBar: false,
      titleBarStyle: 'default',
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        nodeIntegration: true,
        contextIsolation: false
      }
    })

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow?.show()
      this.mainWindow?.webContents.send('settings-loaded', this.store.store)
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
  }

  private setupMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New File',
            accelerator: 'CmdOrCtrl+N',
            click: () => this.mainWindow?.webContents.send('new-file')
          },
          {
            label: 'Open File',
            accelerator: 'CmdOrCtrl+O',
            click: () => this.openFile()
          },
          {
            label: 'Open Folder',
            accelerator: 'CmdOrCtrl+Shift+O',
            click: () => this.openFolder()
          },
          { type: 'separator' },
          {
            label: 'Save',
            accelerator: 'CmdOrCtrl+S',
            click: () => this.mainWindow?.webContents.send('save-file')
          },
          {
            label: 'Save As',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => this.mainWindow?.webContents.send('save-file-as')
          },
          { type: 'separator' },
          {
            label: 'Recent Files',
            submenu: this.getRecentFilesMenu()
          },
          { type: 'separator' },
          {
            label: 'Exit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => app.quit()
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo', label: 'Undo' },
          { role: 'redo', label: 'Redo' },
          { type: 'separator' },
          { role: 'cut', label: 'Cut' },
          { role: 'copy', label: 'Copy' },
          { role: 'paste', label: 'Paste' },
          { type: 'separator' },
          {
            label: 'Find',
            accelerator: 'CmdOrCtrl+F',
            click: () => this.mainWindow?.webContents.send('show-find')
          },
          {
            label: 'Replace',
            accelerator: 'CmdOrCtrl+H',
            click: () => this.mainWindow?.webContents.send('show-replace')
          },
          {
            label: 'Find in Files',
            accelerator: 'CmdOrCtrl+Shift+F',
            click: () => this.mainWindow?.webContents.send('show-find-in-files')
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Toggle Sidebar',
            accelerator: 'CmdOrCtrl+B',
            click: () => this.mainWindow?.webContents.send('toggle-sidebar')
          },
          {
            label: 'Toggle Status Bar',
            click: () => this.mainWindow?.webContents.send('toggle-status-bar')
          },
          {
            label: 'Zen Mode',
            accelerator: 'F11',
            click: () => this.mainWindow?.webContents.send('toggle-zen-mode')
          },
          { type: 'separator' },
          { role: 'reload', label: 'Reload' },
          { role: 'forceReload', label: 'Force Reload' },
          { role: 'toggleDevTools', label: 'Toggle Developer Tools' },
          { type: 'separator' },
          { role: 'resetZoom', label: 'Actual Size' },
          { role: 'zoomIn', label: 'Zoom In' },
          { role: 'zoomOut', label: 'Zoom Out' },
          { type: 'separator' },
          { role: 'togglefullscreen', label: 'Toggle Full Screen' }
        ]
      },
      {
        label: 'Terminal',
        submenu: [
          {
            label: 'New Terminal',
            accelerator: 'Ctrl+`',
            click: () => this.mainWindow?.webContents.send('new-terminal')
          },
          {
            label: 'Toggle Terminal',
            accelerator: 'Ctrl+J',
            click: () => this.mainWindow?.webContents.send('toggle-terminal')
          }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About',
            click: () => this.showAboutDialog()
          },
          {
            label: 'Documentation',
            click: () => shell.openExternal('https://github.com/your-repo/kio')
          }
        ]
      }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }

  private getRecentFilesMenu(): Electron.MenuItemConstructorOptions[] {
    const recentFiles = this.store.get('recentFiles', [])
    return recentFiles.map((filePath: string) => ({
      label: filePath.split('/').pop() || filePath,
      click: () => this.openRecentFile(filePath)
    }))
  }

  private setupIPC(): void {
    // File operations
    ipcMain.handle('open-file-dialog', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        properties: ['openFile'],
        filters: [
          { name: 'All Files', extensions: ['*'] },
          { name: 'Text Files', extensions: ['txt', 'md'] },
          {
            name: 'Code Files',
            extensions: [
              'js',
              'ts',
              'jsx',
              'tsx',
              'html',
              'css',
              'json',
              'xml',
              'py',
              'java',
              'cpp',
              'c',
              'php',
              'rb',
              'go',
              'rs',
              'swift',
              'kt'
            ]
          }
        ]
      })
      return result
    })

    ipcMain.handle('open-folder-dialog', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        properties: ['openDirectory']
      })
      return result
    })

    ipcMain.handle('save-file-dialog', async (_event, defaultPath?: string) => {
      const result = await dialog.showSaveDialog(this.mainWindow!, {
        defaultPath,
        filters: [
          { name: 'All Files', extensions: ['*'] },
          { name: 'Text Files', extensions: ['txt', 'md'] },
          {
            name: 'Code Files',
            extensions: [
              'js',
              'ts',
              'jsx',
              'tsx',
              'html',
              'css',
              'json',
              'xml',
              'py',
              'java',
              'cpp',
              'c',
              'php',
              'rb',
              'go',
              'rs',
              'swift',
              'kt'
            ]
          }
        ]
      })
      return result
    })

    ipcMain.handle('read-file', async (_event, filePath: string) => {
      try {
        const content = await fs.readFile(filePath, 'utf-8')
        this.addToRecentFiles(filePath)
        return { success: true, content }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    ipcMain.handle('write-file', async (_event, filePath: string, content: string) => {
      try {
        await fs.writeFile(filePath, content, 'utf-8')
        this.addToRecentFiles(filePath)
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    ipcMain.handle('read-directory', async (_event, dirPath: string) => {
      try {
        const items = await fs.readdir(dirPath)
        const fileStats = await Promise.all(
          items.map(async (item) => {
            const fullPath = join(dirPath, item)
            const stat = await fs.stat(fullPath)
            return {
              name: item,
              path: fullPath,
              isDirectory: stat.isDirectory(),
              size: stat.size,
              modified: stat.mtime
            }
          })
        )
        return { success: true, items: fileStats }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    // Settings
    ipcMain.handle('get-settings', () => {
      return this.store.store
    })

    ipcMain.handle('update-settings', (_event, settings: Partial<EditorSettings>) => {
      this.store.set(settings)
      return { success: true }
    })

    // File watching
    ipcMain.handle('watch-directory', (_event, dirPath: string) => {
      const watcher = chokidar.watch(dirPath, {
        ignored: /(^|[/\\])\../,
        persistent: true
      })

      watcher
        .on('change', (filePath) => {
          this.mainWindow?.webContents.send('file-changed', filePath)
        })
        .on('add', (filePath) => {
          this.mainWindow?.webContents.send('file-added', filePath)
        })
        .on('unlink', (filePath) => {
          this.mainWindow?.webContents.send('file-removed', filePath)
        })

      this.fileWatchers.set(dirPath, watcher)
      return { success: true }
    })

    // System operations
    ipcMain.handle('show-in-folder', (_event, filePath: string) => {
      shell.showItemInFolder(filePath)
    })

    ipcMain.handle('open-external', (_event, url: string) => {
      shell.openExternal(url)
    })

    // Test IPC
    ipcMain.on('ping', () => console.log('pong'))
  }

  private setupGlobalShortcuts(): void {
    globalShortcut.register('CommandOrControl+Shift+P', () => {
      this.mainWindow?.webContents.send('show-command-palette')
    })

    globalShortcut.register('F11', () => {
      this.mainWindow?.setFullScreen(!this.mainWindow.isFullScreen())
    })
  }

  private setupFileWatchers(): void {
    // Setup will be handled by IPC calls
  }

  private async openFile(): Promise<void> {
    const result = await dialog.showOpenDialog(this.mainWindow!, {
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] },
        {
          name: 'Code Files',
          extensions: [
            'js',
            'ts',
            'jsx',
            'tsx',
            'html',
            'css',
            'json',
            'xml',
            'py',
            'java',
            'cpp',
            'c',
            'php',
            'rb',
            'go',
            'rs',
            'swift',
            'kt'
          ]
        }
      ]
    })

    if (!result.canceled && result.filePaths.length > 0) {
      this.mainWindow?.webContents.send('open-file', result.filePaths[0])
    }
  }

  private async openFolder(): Promise<void> {
    const result = await dialog.showOpenDialog(this.mainWindow!, {
      properties: ['openDirectory']
    })

    if (!result.canceled && result.filePaths.length > 0) {
      this.mainWindow?.webContents.send('open-folder', result.filePaths[0])
    }
  }

  private async openRecentFile(filePath: string): Promise<void> {
    try {
      await fs.access(filePath)
      this.mainWindow?.webContents.send('open-file', filePath)
    } catch {
      dialog.showErrorBox('Error', `File not found: ${filePath}`)
    }
  }

  private addToRecentFiles(filePath: string): void {
    const recentFiles = this.store.get('recentFiles', [])
    const updatedFiles = [filePath, ...recentFiles.filter((f) => f !== filePath)].slice(0, 10)
    this.store.set('recentFiles', updatedFiles)
  }

  private showAboutDialog(): void {
    dialog.showMessageBox(this.mainWindow!, {
      type: 'info',
      title: 'About Kio',
      message: 'Kio - Advanced Code Editor',
      detail:
        'A professional code editor built with Electron and TypeScript\nVersion 1.0.0\n\nFeatures:\n• Syntax highlighting\n• File management\n• Search and replace\n• Multiple themes\n• Auto-save\n• File watching\n• Command palette\n• Terminal integration'
    })
  }
}

// Initialize the application
new AdvancedEditor()
