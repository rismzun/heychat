import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import TopBar from './topbar';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import ConnectionStatus from './ConnectionStatus';

const ChatLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleChatSelect = (chatId) => {
    setSelectedChatId(chatId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <ConnectionStatus />
      
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        mt: '64px',
        overflow: 'hidden'
      }}>
        <ChatSidebar 
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChatId}
        />
        
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0 // Prevent flex item from overflowing
        }}>
          <ChatWindow chatId={selectedChatId} />
        </Box>
      </Box>
    </Box>
  );
};

export default ChatLayout;
