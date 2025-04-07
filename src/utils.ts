import { GameInfo } from './types';

export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export const formatTimestamp = (timestamp: number): string => {
  if (!timestamp) return 'Never';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  
  if (diffInHours < 48) {
    return 'Yesterday';
  }
  
  return date.toLocaleDateString();
};

export const sortGames = (games: GameInfo[], sortBy: string): GameInfo[] => {
  return [...games].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'lastPlayed':
        return (b.lastPlayed || 0) - (a.lastPlayed || 0);
      case 'playCount':
        return (b.playCount || 0) - (a.playCount || 0);
      case 'size':
        return b.size - a.size;
      default:
        return 0;
    }
  });
};

export const filterGames = (
  games: GameInfo[],
  searchQuery: string,
  category: string,
  showFavoritesOnly: boolean
): GameInfo[] => {
  return games.filter(game => {
    // Filter by search query
    const matchesSearch = !searchQuery || 
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by category
    const matchesCategory = category === 'all' || game.category === category;
    
    // Filter by favorites
    const matchesFavorites = !showFavoritesOnly || game.isFavorite;
    
    return matchesSearch && matchesCategory && matchesFavorites;
  });
};

export const getUniqueCategories = (games: GameInfo[]): string[] => {
  const categories = new Set(games.map(game => game.category || 'Uncategorized'));
  return Array.from(categories).sort();
};

export const getUniqueTags = (games: GameInfo[]): string[] => {
  const tags = new Set(games.flatMap(game => game.tags || []));
  return Array.from(tags).sort();
}; 