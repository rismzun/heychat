import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Switch,
  FormControlLabel,
  useTheme
} from '@mui/material';
import {
  Chat as ChatIcon,
  Settings,
  Logout,
  Person,
  DarkMode,
  LightMode
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme as useCustomTheme } from '../context/ThemeContext';

const TopBar = () => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleThemeToggle = () => {
    toggleTheme();
    handleMenuClose();
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ChatIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            HeyChat
          </Typography>
        </Box>

        {/* User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user?.fullName}
          </Typography>
          
          <IconButton onClick={handleMenuOpen}>
            <Avatar 
              src={user?.avatar} 
              sx={{ width: 32, height: 32 }}
            >
              {user?.fullName?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1
                }
              }
            }}
          >
            <MenuItem disabled>
              <Person sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {user?.fullName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  @{user?.username}
                </Typography>
              </Box>
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleThemeToggle}>
              {isDarkMode ? <LightMode sx={{ mr: 2 }} /> : <DarkMode sx={{ mr: 2 }} />}
              <FormControlLabel
                control={<Switch checked={isDarkMode} size="small" />}
                label={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                sx={{ m: 0 }}
              />
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 2 }} />
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
