import React, { useState, useEffect } from 'react';
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
  LinearProgress
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
  Update as UpdateIcon
} from '@mui/icons-material';
import { ipcRenderer } from 'electron';

interface GameInfo {
  name: string;
  path: string;
  executable: string;
  lastModified: number;
  size: number;
  icon?: string;
}

const drawerWidth = 240;

const App: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [games, setGames] = useState<GameInfo[]>([]);
  const [gamesDirectory, setGamesDirectory] = useState<string>('');
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Listen for games updates
    ipcRenderer.on('games-updated', (_, updatedGames: GameInfo[]) => {
      setGames(updatedGames);
    });

    // Listen for update status
    ipcRenderer.on('update-status', (_, status: string) => {
      setUpdateStatus(status);
      if (status.includes('downloaded')) {
        setShowUpdateDialog(true);
      }
    });

    // Get initial games directory
    ipcRenderer.invoke('get-games-directory').then(setGamesDirectory);

    return () => {
      ipcRenderer.removeAllListeners('games-updated');
      ipcRenderer.removeAllListeners('update-status');
    };
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMinimize = () => {
    ipcRenderer.invoke('minimize-window');
  };

  const handleMaximize = () => {
    ipcRenderer.invoke('maximize-window');
  };

  const handleClose = () => {
    ipcRenderer.invoke('close-window');
  };

  const handleSelectDirectory = async () => {
    const newDir = await ipcRenderer.invoke('select-games-directory');
    if (newDir) {
      setGamesDirectory(newDir);
    }
  };

  const handleLaunchGame = (executable: string) => {
    ipcRenderer.invoke('launch-game', executable);
  };

  const handleCheckUpdates = () => {
    ipcRenderer.invoke('check-for-updates');
  };

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
          <Box sx={{ WebkitAppRegion: 'no-drag' }}>
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
          
          <Grid container spacing={3}>
            {games.map((game) => (
              <Grid item xs={12} sm={6} md={4} key={game.path}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'background.paper',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={game.icon || '/game-placeholder.jpg'}
                    alt={game.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {game.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Last modified: {new Date(game.lastModified).toLocaleDateString()}
                    </Typography>
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => handleLaunchGame(game.executable)}
                      startIcon={<GamesIcon />}
                    >
                      Play
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Dialog open={showUpdateDialog} onClose={() => setShowUpdateDialog(false)}>
        <DialogTitle>Update Available</DialogTitle>
        <DialogContent>
          <Typography>
            A new version has been downloaded. Would you like to install it now?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpdateDialog(false)}>Later</Button>
          <Button onClick={() => ipcRenderer.invoke('quit-and-install')} autoFocus>
            Install Now
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showSettings} onClose={() => setShowSettings(false)}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Games Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {gamesDirectory}
          </Typography>
          <Button
            startIcon={<FolderIcon />}
            onClick={handleSelectDirectory}
            sx={{ mt: 2 }}
          >
            Change Directory
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default App; 