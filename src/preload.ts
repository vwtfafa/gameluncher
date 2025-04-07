import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // Game management
    getGamesDirectory: () => ipcRenderer.invoke('get-games-directory'),
    selectGamesDirectory: () => ipcRenderer.invoke('select-games-directory'),
    launchGame: (executable: string) => ipcRenderer.invoke('launch-game', executable),
    
    // Window management
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    
    // Updates
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    
    // Events
    onGamesUpdated: (callback: (games: any[]) => void) => {
      ipcRenderer.on('games-updated', (_, games) => callback(games));
      return () => ipcRenderer.removeListener('games-updated', callback);
    },
    onUpdateStatus: (callback: (status: string) => void) => {
      ipcRenderer.on('update-status', (_, status) => callback(status));
      return () => ipcRenderer.removeListener('update-status', callback);
    }
  }
); 