import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Divider,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search,
  Add,
  PersonAdd,
  MoreVert,
  Circle
} from '@mui/icons-material';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const DRAWER_WIDTH = 320;
const API_BASE_URL = 'http://localhost:5000/api';

const ChatSidebar = ({ onChatSelect, selectedChatId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const { chats, loadChats, createChat, onlineUsers } = useSocket();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addFriendDialog, setAddFriendDialog] = useState(false);
  const [friendUsername, setFriendUsername] = useState('');
  const [friendError, setFriendError] = useState('');
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    loadChats();
    loadFriends();
  }, [loadChats]);

  const loadFriends = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/friends`);
      setFriends(response.data.friends);
    } catch (error) {
      console.error('Load friends error:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users/search`, {
        params: { q: query }
      });
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const handleCreateChat = async (userId) => {
    try {
      const chat = await createChat(userId);
      if (chat) {
        onChatSelect(chat._id);
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Create chat error:', error);
    }
  };

  const handleAddFriend = async () => {
    if (!friendUsername.trim()) return;
    
    try {
      await axios.post(`${API_BASE_URL}/users/friend-request`, {
        username: friendUsername.trim()
      });
      setAddFriendDialog(false);
      setFriendUsername('');
      setFriendError('');
      // Optionally show success message
    } catch (error) {
      setFriendError(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  const getOtherParticipant = (chat) => {
    return chat.participants.find(p => p._id !== user?.id);
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never';
    return formatDistanceToNow(new Date(lastSeen), { addSuffix: true });
  };

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const otherUser = getOtherParticipant(chat);
    return otherUser?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const ChatItem = ({ chat }) => {
    const otherUser = getOtherParticipant(chat);
    const isOnline = onlineUsers.has(otherUser?._id);
    const isSelected = selectedChatId === chat._id;

    return (
      <ListItem disablePadding>
        <ListItemButton
          selected={isSelected}
          onClick={() => onChatSelect(chat._id)}
          sx={{
            py: 1.5,
            px: 2,
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: theme.palette.action.selected,
              '&:hover': {
                backgroundColor: theme.palette.action.selected,
              }
            }
          }}
        >
          <ListItemAvatar>
            <Badge
              variant="dot"
              color="success"
              invisible={!isOnline}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              <Avatar src={otherUser?.avatar} sx={{ width: 50, height: 50 }}>
                {otherUser?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
          </ListItemAvatar>
          
          <ListItemText
            primary={
              <Typography variant="subtitle1" fontWeight="500">
                {otherUser?.fullName}
              </Typography>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {chat.lastMessage?.content || 'No messages yet'}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {isOnline ? 'Online' : formatLastSeen(otherUser?.lastSeen)}
                </Typography>
              </Box>
            }
          />
        </ListItemButton>
      </ListItem>
    );
  };

  const SearchResultItem = ({ user: searchUser }) => (
    <ListItem disablePadding>
      <ListItemButton
        onClick={() => handleCreateChat(searchUser._id)}
        sx={{ py: 1, px: 2 }}
      >
        <ListItemAvatar>
          <Avatar src={searchUser.avatar}>
            {searchUser.fullName?.charAt(0).toUpperCase()}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={searchUser.fullName}
          secondary={`@${searchUser.username}`}
        />
      </ListItemButton>
    </ListItem>
  );

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Messages
          </Typography>
          <IconButton
            size="small"
            onClick={() => setAddFriendDialog(true)}
          >
            <PersonAdd />
          </IconButton>
        </Box>
        
        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search messages or add friends..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: theme.palette.action.hover,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              '&.Mui-focused': {
                backgroundColor: theme.palette.background.paper,
              }
            }
          }}
        />
      </Box>

      <Divider />

      {/* Chat List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ pt: 1 }}>
          {searchResults.length > 0 ? (
            <>
              <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'textSecondary' }}>
                Search Results
              </Typography>
              {searchResults.map((searchUser) => (
                <SearchResultItem key={searchUser._id} user={searchUser} />
              ))}
              <Divider sx={{ my: 1 }} />
            </>
          ) : null}
          
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <ChatItem key={chat._id} chat={chat} />
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
              <Typography variant="body2" color="textSecondary">
                {searchQuery ? 'No chats found' : 'No conversations yet'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Search for users to start chatting
              </Typography>
            </Box>
          )}
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            mt: '64px',
            height: 'calc(100vh - 64px)',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Add Friend Dialog */}
      <Dialog
        open={addFriendDialog}
        onClose={() => {
          setAddFriendDialog(false);
          setFriendUsername('');
          setFriendError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Friend</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Enter the username of the person you want to add as a friend.
          </Typography>
          
          {friendError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {friendError}
            </Alert>
          )}
          
          <TextField
            autoFocus
            fullWidth
            label="Username"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            placeholder="Enter username..."
            InputProps={{
              startAdornment: <InputAdornment position="start">@</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFriendDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddFriend}
            variant="contained"
            disabled={!friendUsername.trim()}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChatSidebar;
