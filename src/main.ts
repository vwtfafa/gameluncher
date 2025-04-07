import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import Store from 'electron-store';
import { debounce } from 'lodash';

// Initialize electron store
const store = new Store();
const GAMES_DIR_KEY = 'gamesDirectory';
const GAMES_CACHE_KEY = 'gamesCache';

interface GameInfo {
  name: string;
  path: string;
  executable: string;
  lastModified: number;
  size: number;
  icon?: string;
  category?: string;
  tags?: string[];
  lastPlayed?: number;
  playCount?: number;
}

let mainWindow: BrowserWindow | null = null;
let gamesWatcher: chokidar.FSWatcher | null = null;

// Initialize games directory
function initGamesDirectory() {
  const defaultGamesPath = path.join(app.getPath('documents'), 'My Games');
  const gamesDir = store.get(GAMES_DIR_KEY, defaultGamesPath);
  
  if (!fs.existsSync(gamesDir as string)) {
    fs.mkdirSync(gamesDir as string, { recursive: true });
  }
  
  return gamesDir as string;
}

// Watch for game directory changes with debouncing
function watchGamesDirectory(gamesDir: string) {
  if (gamesWatcher) {
    gamesWatcher.close();
  }

  gamesWatcher = chokidar.watch(gamesDir, {
    ignored: /(^|[\/\\])\../, // ignore hidden files
    persistent: true
  });

  const debouncedScan = debounce(() => scanAndUpdateGames(gamesDir), 1000);

  gamesWatcher
    .on('add', debouncedScan)
    .on('unlink', debouncedScan)
    .on('change', debouncedScan);
}

// Scan games directory and update the list
async function scanAndUpdateGames(gamesDir: string) {
  const games: GameInfo[] = [];
  const cachedGames = store.get(GAMES_CACHE_KEY, {}) as Record<string, GameInfo>;
  
  try {
    const files = fs.readdirSync(gamesDir);
    
    for (const file of files) {
      const fullPath = path.join(gamesDir, file);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        // Look for executable files in the directory
        const exeFiles = fs.readdirSync(fullPath)
          .filter(f => f.endsWith('.exe'));
        
        if (exeFiles.length > 0) {
          const gamePath = path.join(fullPath, exeFiles[0]);
          const cachedGame = cachedGames[gamePath];
          
          const gameInfo: GameInfo = {
            name: file,
            path: fullPath,
            executable: gamePath,
            lastModified: stats.mtimeMs,
            size: stats.size,
            category: cachedGame?.category || 'Uncategorized',
            tags: cachedGame?.tags || [],
            lastPlayed: cachedGame?.lastPlayed || 0,
            playCount: cachedGame?.playCount || 0
          };
          
          games.push(gameInfo);
          cachedGames[gamePath] = gameInfo;
        }
      }
    }
    
    store.set(GAMES_CACHE_KEY, cachedGames);
    mainWindow?.webContents.send('games-updated', games);
  } catch (error) {
    console.error('Error scanning games directory:', error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#1a1a1a',
    show: false
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Initialize and watch games directory
  const gamesDir = initGamesDirectory();
  watchGamesDirectory(gamesDir);
  scanAndUpdateGames(gamesDir);
}

// Auto-updater events with rate limiting
let lastUpdateCheck = 0;
const UPDATE_CHECK_INTERVAL = 1000 * 60 * 60; // 1 hour

autoUpdater.on('checking-for-update', () => {
  mainWindow?.webContents.send('update-status', 'Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  mainWindow?.webContents.send('update-status', 'Update available.');
});

autoUpdater.on('update-not-available', (info) => {
  mainWindow?.webContents.send('update-status', 'Up to date.');
});

autoUpdater.on('error', (err) => {
  mainWindow?.webContents.send('update-status', 'Error in auto-updater.');
});

autoUpdater.on('download-progress', (progressObj) => {
  mainWindow?.webContents.send('update-status', `Downloading... ${progressObj.percent}%`);
});

autoUpdater.on('update-downloaded', (info) => {
  mainWindow?.webContents.send('update-status', 'Update downloaded. Will install on restart.');
});

app.whenReady().then(() => {
  createWindow();
  
  // Check for updates with rate limiting
  const now = Date.now();
  if (now - lastUpdateCheck > UPDATE_CHECK_INTERVAL) {
    autoUpdater.checkForUpdatesAndNotify();
    lastUpdateCheck = now;
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers with input validation
ipcMain.handle('select-games-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  
  if (!result.canceled) {
    const newDir = result.filePaths[0];
    if (fs.existsSync(newDir)) {
      store.set(GAMES_DIR_KEY, newDir);
      watchGamesDirectory(newDir);
      scanAndUpdateGames(newDir);
      return newDir;
    }
  }
  return null;
});

ipcMain.handle('get-games-directory', () => {
  return store.get(GAMES_DIR_KEY);
});

ipcMain.handle('launch-game', (event, executable: string) => {
  if (typeof executable === 'string' && fs.existsSync(executable)) {
    const process = require('child_process').spawn(executable, [], {
      detached: true,
      stdio: 'ignore'
    });
    
    // Update game stats
    const cachedGames = store.get(GAMES_CACHE_KEY, {}) as Record<string, GameInfo>;
    if (cachedGames[executable]) {
      cachedGames[executable].lastPlayed = Date.now();
      cachedGames[executable].playCount = (cachedGames[executable].playCount || 0) + 1;
      store.set(GAMES_CACHE_KEY, cachedGames);
    }
    
    process.unref();
  }
});

ipcMain.handle('check-for-updates', () => {
  const now = Date.now();
  if (now - lastUpdateCheck > UPDATE_CHECK_INTERVAL) {
    autoUpdater.checkForUpdatesAndNotify();
    lastUpdateCheck = now;
  }
});

ipcMain.handle('minimize-window', () => {
  mainWindow?.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle('close-window', () => {
  mainWindow?.close();
}); 