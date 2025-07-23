import React from 'react';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';
import { 
  WifiOff, 
  Wifi, 
  Warning,
  Check
} from '@mui/icons-material';
import { useSocket } from '../context/SocketContext';

const ConnectionStatus = () => {
  const { isConnected, connectionError } = useSocket();

  if (isConnected) {
    return (
      <Chip
        icon={<Check />}
        label="Connected"
        color="success"
        size="small"
        sx={{ 
          position: 'fixed',
          top: 70,
          right: 16,
          zIndex: 1000,
          opacity: 0.8
        }}
      />
    );
  }

  if (connectionError) {
    return (
      <Chip
        icon={<Warning />}
        label={`Error: ${connectionError}`}
        color="error"
        size="small"
        sx={{ 
          position: 'fixed',
          top: 70,
          right: 16,
          zIndex: 1000
        }}
      />
    );
  }

  return (
    <Chip
      icon={<CircularProgress size={16} />}
      label="Connecting..."
      color="warning"
      size="small"
      sx={{ 
        position: 'fixed',
        top: 70,
        right: 16,
        zIndex: 1000
      }}
    />
  );
};

export default ConnectionStatus;
