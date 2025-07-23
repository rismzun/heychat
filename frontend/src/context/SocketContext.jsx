import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import axios from 'axios';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const SocketProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});

  // Initialize socket connection
  useEffect(() => {
    let newSocket = null;

    if (isAuthenticated && token && !socket) {
      console.log('Initializing socket connection...');
      
      newSocket = io('http://localhost:5000', {
        auth: {
          token: token
        },
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
        forceNew: true
      });

      newSocket.on('connect', () => {
        console.log('Socket connected successfully:', newSocket.id);
        setSocket(newSocket);
        setIsConnected(true);
        setConnectionError(null);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        // Only set socket to null if it's a permanent disconnect
        if (reason === 'io server disconnect' || reason === 'io client disconnect') {
          setSocket(null);
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
        // If authentication fails, don't retry
        if (error.message.includes('Authentication error')) {
          newSocket.disconnect();
          setSocket(null);
        }
      });

      newSocket.on('reconnect_attempt', (attemptNumber) => {
        console.log('Socket reconnection attempt:', attemptNumber);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        setSocket(newSocket);
        setIsConnected(true);
        setConnectionError(null);
      });

      newSocket.on('reconnect_failed', () => {
        console.log('Socket reconnection failed');
        setSocket(null);
      });
    }

    return () => {
      if (newSocket) {
        console.log('Cleaning up socket connection...');
        newSocket.removeAllListeners();
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, token]); // Remove socket from dependencies

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ message, chat }) => {
      setMessages(prev => ({
        ...prev,
        [message.chat]: [...(prev[message.chat] || []), message]
      }));

      // Update chat list with new last message
      setChats(prev => prev.map(c => 
        c._id === chat._id 
          ? { ...c, lastMessage: message, lastActivity: chat.lastActivity }
          : c
      ).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)));
    };

    const handleUserTyping = ({ userId, username, isTyping, chatId }) => {
      if (userId === user?.id) return;
      
      setTypingUsers(prev => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          [userId]: isTyping ? { username } : undefined
        }
      }));
    };

    const handleFriendStatusChange = ({ userId, isOnline, lastSeen }) => {
      if (isOnline) {
        setOnlineUsers(prev => new Set([...prev, userId]));
      } else {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('friend_status_change', handleFriendStatusChange);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('friend_status_change', handleFriendStatusChange);
    };
  }, [socket, user]);

  // Load chats
  const loadChats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chats`);
      setChats(response.data.chats);
    } catch (error) {
      console.error('Load chats error:', error);
    }
  }, []);

  // Load messages for a chat
  const loadMessages = useCallback(async (chatId, page = 1) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/${chatId}`, {
        params: { page, limit: 50 }
      });
      
      if (page === 1) {
        setMessages(prev => ({
          ...prev,
          [chatId]: response.data.messages
        }));
      } else {
        setMessages(prev => ({
          ...prev,
          [chatId]: [...response.data.messages, ...(prev[chatId] || [])]
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error('Load messages error:', error);
      return { messages: [], hasMore: false };
    }
  }, []);

  // Send message
  const sendMessage = useCallback((chatId, content, messageType = 'text') => {
    if (socket && chatId && content.trim()) {
      socket.emit('send_message', {
        chatId,
        content: content.trim(),
        messageType
      });
    }
  }, [socket]);

  // Join chat
  const joinChat = useCallback((chatId) => {
    if (socket && chatId) {
      socket.emit('join_chat', chatId);
      setCurrentChat(chatId);
    }
  }, [socket]);

  // Leave chat
  const leaveChat = useCallback((chatId) => {
    if (socket && chatId) {
      socket.emit('leave_chat', chatId);
      if (currentChat === chatId) {
        setCurrentChat(null);
      }
    }
  }, [socket, currentChat]);

  // Typing indicator
  const setTyping = useCallback((chatId, isTyping) => {
    if (socket && chatId) {
      socket.emit('typing', { chatId, isTyping });
    }
  }, [socket]);

  // Create or get chat
  const createChat = useCallback(async (participantId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chats/create`, {
        participantId
      });
      
      const chat = response.data.chat;
      setChats(prev => {
        const existing = prev.find(c => c._id === chat._id);
        if (existing) return prev;
        return [chat, ...prev];
      });
      
      return chat;
    } catch (error) {
      console.error('Create chat error:', error);
      return null;
    }
  }, []);

  // Clean up on logout
  useEffect(() => {
    if (!isAuthenticated && socket) {
      console.log('User logged out, cleaning up socket...');
      socket.removeAllListeners();
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setConnectionError(null);
      setChats([]);
      setMessages({});
      setCurrentChat(null);
      setOnlineUsers(new Set());
      setTypingUsers({});
    }
  }, [isAuthenticated, socket]);

  const value = {
    socket,
    isConnected,
    connectionError,
    chats,
    currentChat,
    messages,
    onlineUsers,
    typingUsers,
    loadChats,
    loadMessages,
    sendMessage,
    joinChat,
    leaveChat,
    setTyping,
    createChat,
    setCurrentChat
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
