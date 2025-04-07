import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  LinearProgress,
  TextField,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  useTheme,
  ThemeProvider,
  createTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  CropSquare as CropSquareIcon,
  Games as GamesIcon,
  CloudDownload as CloudDownloadIcon,
  Settings as SettingsIcon,
  Folder as FolderIcon,
  Refresh as RefreshIcon,
  Update as UpdateIcon,
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon
} from '@mui/icons-material';

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
  isFavorite?: boolean;
}

const drawerWidth = 240;

const App: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [games, setGames] = useState<GameInfo[]>([]);
  const [gamesDirectory, setGamesDirectory] = useState<string>('');
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [darkMode, setDarkMode] = useState(true);
  const [sortBy, setSortBy] = useState<string>('name');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode],
  );

  useEffect(() => {
    // Get initial games directory
    window.api.getGamesDirectory().then(setGamesDirectory);

    // Set up event listeners
    const removeGamesListener = window.api.onGamesUpdated(setGames);
    const removeUpdateListener = window.api.onUpdateStatus(setUpdateStatus);

    return () => {
      removeGamesListener();
      removeUpdateListener();
    };
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMinimize = () => {
    window.api.minimizeWindow();
  };

  const handleMaximize = () => {
    window.api.maximizeWindow();
  };

  const handleClose = () => {
    window.api.closeWindow();
  };

  const handleSelectDirectory = async () => {
    const newDir = await window.api.selectGamesDirectory();
    if (newDir) {
      setGamesDirectory(newDir);
    }
  };

  const handleLaunchGame = (executable: string) => {
    window.api.launchGame(executable);
  };

  const handleCheckUpdates = () => {
    window.api.checkForUpdates();
  };

  const filteredGames = useMemo(() => {
    let filtered = [...games];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(game => game.category === selectedCategory);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastPlayed':
          return (b.lastPlayed || 0) - (a.lastPlayed || 0);
        case 'playCount':
          return (b.playCount || 0) - (a.playCount || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [games, searchQuery, selectedCategory, sortBy]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(games.map(game => game.category || 'Uncategorized'));
    return Array.from(uniqueCategories);
  }, [games]);

  const drawer = (
    <div>
      <Toolbar />
      <List>
        <ListItem button>
          <ListItemIcon>
            <GamesIcon />
          </ListItemIcon>
          <ListItemText primary="My Games" />
        </ListItem>
        <ListItem button onClick={handleSelectDirectory}>
          <ListItemIcon>
            <FolderIcon />
          </ListItemIcon>
          <ListItemText primary="Select Games Folder" />
        </ListItem>
        <ListItem button onClick={handleCheckUpdates}>
          <ListItemIcon>
            <UpdateIcon />
          </ListItemIcon>
          <ListItemText primary="Check for Updates" />
        </ListItem>
        <ListItem button onClick={() => setShowSettings(true)}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="fixed" sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <Toolbar sx={{ 
            minHeight: 48,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            WebkitAppRegion: 'drag'
          }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' }, WebkitAppRegion: 'no-drag' }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Game Launcher
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, WebkitAppRegion: 'no-drag' }}>
              <TextField
                size="small"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="lastPlayed">Last Played</MenuItem>
                  <MenuItem value="playCount">Play Count</MenuItem>
                </Select>
              </FormControl>
              <IconButton onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                {viewMode === 'grid' ? <GridViewIcon /> : <ViewListIcon />}
              </IconButton>
              <IconButton onClick={handleMinimize} color="inherit" size="small">
                <MinimizeIcon />
              </IconButton>
              <IconButton onClick={handleMaximize} color="inherit" size="small">
                <CropSquareIcon />
              </IconButton>
              <IconButton onClick={handleClose} color="inherit" size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box',
                width: drawerWidth,
                bgcolor: 'background.paper',
                borderRight: '1px solid rgba(255, 255, 255, 0.12)'
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            height: '100vh',
            overflow: 'auto'
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            {updateStatus && (
              <Box sx={{ mb: 3 }}>
                <Alert severity="info" sx={{ mb: 1 }}>
                  {updateStatus}
                </Alert>
                {updateStatus.includes('Downloading') && <LinearProgress />}
              </Box>
            )}
            
            <Typography variant="h4" sx={{ mb: 3 }}>
              My Games
            </Typography>
            
            {viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {filteredGames.map((game) => (
                  <Grid item xs={12} sm={6} md={4} key={game.path}>
                    <Card sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative'
                    }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={game.icon || '/default-game-icon.png'}
                        alt={game.name}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography gutterBottom variant="h5" component="h2">
                            {game.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const updatedGames = games.map(g => 
                                g.path === game.path ? { ...g, isFavorite: !g.isFavorite } : g
                              );
                              setGames(updatedGames);
                            }}
                          >
                            {game.isFavorite ? <StarIcon color="primary" /> : <StarBorderIcon />}
                          </IconButton>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Last played: {game.lastPlayed ? new Date(game.lastPlayed).toLocaleDateString() : 'Never'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Play count: {game.playCount || 0}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                          {game.tags?.map(tag => (
                            <Chip key={tag} label={tag} size="small" />
                          ))}
                        </Box>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleLaunchGame(game.executable)}
                        >
                          Play
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <List>
                {filteredGames.map((game) => (
                  <ListItem
                    key={game.path}
                    sx={{
                      bgcolor: 'background.paper',
                      mb: 1,
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon>
                      <img
                        src={game.icon || '/default-game-icon.png'}
                        alt={game.name}
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={game.name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.secondary">
                            Last played: {game.lastPlayed ? new Date(game.lastPlayed).toLocaleDateString() : 'Never'} • 
                            Play count: {game.playCount || 0}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {game.tags?.map(tag => (
                              <Chip key={tag} label={tag} size="small" />
                            ))}
                          </Box>
                        </>
                      }
                    />
                    <Button
                      variant="contained"
                      onClick={() => handleLaunchGame(game.executable)}
                    >
                      Play
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </Container>
        </Box>
        <Dialog open={showSettings} onClose={() => setShowSettings(false)}>
          <DialogTitle>Settings</DialogTitle>
          <DialogContent>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
              }
              label="Dark Mode"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSettings(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default App; 