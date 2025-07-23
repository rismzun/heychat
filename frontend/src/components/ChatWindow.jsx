import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Divider,
  Badge,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Send,
  EmojiEmotions,
  AttachFile,
  MoreVert,
  Circle
} from '@mui/icons-material';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

const ChatWindow = ({ chatId }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { 
    chats, 
    messages, 
    loadMessages, 
    sendMessage, 
    joinChat, 
    leaveChat,
    setTyping,
    onlineUsers,
    typingUsers
  } = useSocket();
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentChat = chats.find(chat => chat._id === chatId);
  const chatMessages = messages[chatId] || [];
  const otherUser = currentChat?.participants.find(p => p._id !== user?.id);
  const isOtherUserOnline = onlineUsers.has(otherUser?._id);

  // Join chat and load messages
  useEffect(() => {
    if (chatId) {
      joinChat(chatId);
      loadInitialMessages();
      
      return () => {
        leaveChat(chatId);
      };
    }
  }, [chatId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const loadInitialMessages = async () => {
    setIsLoading(true);
    await loadMessages(chatId);
    setIsLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && chatId) {
      sendMessage(chatId, newMessage.trim());
      setNewMessage('');
      handleStopTyping();
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = useCallback((value) => {
    setNewMessage(value);
    
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      setTyping(chatId, true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  }, [chatId, isTyping, setTyping]);

  const handleStopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      setTyping(chatId, false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [chatId, isTyping, setTyping]);

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const MessageBubble = ({ message }) => {
    const isOwnMessage = message.sender._id === user?.id;
    const isEdited = message.editedAt;
    
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
          mb: 1
        }}
      >
        {!isOwnMessage && (
          <Avatar 
            src={message.sender.avatar} 
            sx={{ width: 28, height: 28, mr: 1 }}
          >
            {message.sender.fullName?.charAt(0).toUpperCase()}
          </Avatar>
        )}
        
        <Box
          sx={{
            maxWidth: '70%',
            backgroundColor: isOwnMessage 
              ? theme.palette.primary.main 
              : theme.palette.background.paper,
            color: isOwnMessage 
              ? theme.palette.primary.contrastText 
              : theme.palette.text.primary,
            borderRadius: 3,
            px: 2,
            py: 1,
            border: !isOwnMessage ? `1px solid ${theme.palette.divider}` : 'none',
            position: 'relative'
          }}
        >
          <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
            {message.content}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end',
            mt: 0.5,
            gap: 0.5
          }}>
            {isEdited && (
              <Typography 
                variant="caption" 
                sx={{ 
                  opacity: 0.7,
                  fontStyle: 'italic'
                }}
              >
                edited
              </Typography>
            )}
            <Typography 
              variant="caption" 
              sx={{ opacity: 0.7 }}
            >
              {formatMessageTime(message.createdAt)}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const TypingIndicator = () => {
    const typingInThisChat = typingUsers[chatId] || {};
    const typingUsersList = Object.entries(typingInThisChat)
      .filter(([userId, data]) => data && userId !== user?.id)
      .map(([userId, data]) => data.username);

    if (typingUsersList.length === 0) return null;

    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        mb: 1,
        ml: 4
      }}>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          px: 2,
          py: 1
        }}>
          <Typography variant="caption" color="textSecondary" sx={{ mr: 1 }}>
            {typingUsersList.join(', ')} {typingUsersList.length === 1 ? 'is' : 'are'} typing
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.3 }}>
            {[0, 1, 2].map((i) => (
              <Circle
                key={i}
                sx={{
                  fontSize: 6,
                  color: theme.palette.text.secondary,
                  animation: 'pulse 1.4s infinite',
                  animationDelay: `${i * 0.2}s`,
                  '@keyframes pulse': {
                    '0%, 60%, 100%': {
                      opacity: 0.3
                    },
                    '30%': {
                      opacity: 1
                    }
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  if (!currentChat) {
    return (
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'
      }}>
        <Typography variant="h6" color="textSecondary">
          Select a conversation to start messaging
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh'
    }}>
      {/* Chat Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              variant="dot"
              color="success"
              invisible={!isOtherUserOnline}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              <Avatar src={otherUser?.avatar} sx={{ width: 40, height: 40, mr: 2 }}>
                {otherUser?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
            
            <Box>
              <Typography variant="h6" fontWeight="500">
                {otherUser?.fullName}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {isOtherUserOnline 
                  ? 'Online' 
                  : `Last seen ${formatDistanceToNow(new Date(otherUser?.lastSeen || Date.now()), { addSuffix: true })}`
                }
              </Typography>
            </Box>
          </Box>
          
          <IconButton>
            <MoreVert />
          </IconButton>
        </Box>
      </Paper>

      {/* Messages Area */}
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        p: 2,
        backgroundColor: alpha(theme.palette.background.default, 0.5)
      }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : chatMessages.length === 0 ? (
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center'
          }}>
            <Avatar 
              src={otherUser?.avatar} 
              sx={{ width: 80, height: 80, mb: 2 }}
            >
              {otherUser?.fullName?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {otherUser?.fullName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Start a conversation with {otherUser?.fullName.split(' ')[0]}
            </Typography>
          </Box>
        ) : (
          <>
            {chatMessages.map((message) => (
              <MessageBubble key={message._id} message={message} />
            ))}
            <TypingIndicator />
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Message Input */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderTop: `1px solid ${theme.palette.divider}`,
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <IconButton size="small">
            <AttachFile />
          </IconButton>
          
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: theme.palette.background.default,
              }
            }}
          />
          
          <IconButton size="small">
            <EmojiEmotions />
          </IconButton>
          
          <IconButton 
            color="primary"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{
              backgroundColor: newMessage.trim() ? theme.palette.primary.main : 'transparent',
              color: newMessage.trim() ? theme.palette.primary.contrastText : theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: newMessage.trim() ? theme.palette.primary.dark : theme.palette.action.hover,
              }
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatWindow;
