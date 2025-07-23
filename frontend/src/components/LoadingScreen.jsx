import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Chat } from '@mui/icons-material';

const LoadingScreen = () => {
  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Chat sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
        <Typography variant="h4" fontWeight="bold" color="primary">
          HeyChat
        </Typography>
      </Box>
      
      <CircularProgress size={40} />
      
      <Typography variant="body2" color="textSecondary">
        Loading...
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
