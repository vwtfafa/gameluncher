export interface GameInfo {
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
  isFavorite?: boolean;
}

export interface ElectronAPI {
  // Game management
  getGamesDirectory: () => Promise<string>;
  selectGamesDirectory: () => Promise<string | null>;
  launchGame: (executable: string) => Promise<void>;
  
  // Window management
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  
  // Updates
  checkForUpdates: () => Promise<void>;
  
  // Events
  onGamesUpdated: (callback: (games: GameInfo[]) => void) => () => void;
  onUpdateStatus: (callback: (status: string) => void) => () => void;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
} 