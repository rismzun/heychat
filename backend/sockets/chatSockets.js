import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

export const handleSocketConnection = (socket, io) => {
  console.log(`✅ User ${socket.user.username} connected (ID: ${socket.id})`);

  // Update user online status
  updateUserOnlineStatus(socket.userId, true);

  // Join user to their personal room
  socket.join(socket.userId);
  console.log(`📱 User ${socket.user.username} joined personal room: ${socket.userId}`);

  // Join user to all their chat rooms
  joinUserChats(socket);

  // Handle joining a specific chat
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`💬 User ${socket.user.username} joined chat ${chatId}`);
  });

  // Handle leaving a specific chat
  socket.on('leave_chat', (chatId) => {
    socket.leave(chatId);
    console.log(`👋 User ${socket.user.username} left chat ${chatId}`);
  });

  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const { chatId, content, messageType = 'text' } = data;

      // Verify user is part of the chat
      const chat = await Chat.findOne({
        _id: chatId,
        participants: socket.userId
      }).populate('participants', 'username fullName avatar isOnline');

      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      // Create and save message
      const message = new Message({
        sender: socket.userId,
        chat: chatId,
        content,
        messageType
      });

      await message.save();
      await message.populate('sender', 'username fullName avatar');

      // Update chat's last message and activity
      chat.lastMessage = message._id;
      chat.lastActivity = new Date();
      await chat.save();

      // Emit message to all participants in the chat
      io.to(chatId).emit('new_message', {
        message,
        chat: {
          _id: chat._id,
          participants: chat.participants,
          lastActivity: chat.lastActivity
        }
      });

      // Send notification to offline users
      const offlineParticipants = chat.participants.filter(
        participant => participant._id.toString() !== socket.userId && !participant.isOnline
      );
      
      // Here you could implement push notifications for offline users
      
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', ({ chatId, isTyping }) => {
    socket.to(chatId).emit('user_typing', {
      userId: socket.userId,
      username: socket.user.username,
      isTyping
    });
  });

  // Handle message read status
  socket.on('mark_read', async ({ chatId, messageIds }) => {
    try {
      await Message.updateMany(
        {
          _id: { $in: messageIds },
          chat: chatId,
          sender: { $ne: socket.userId },
          'readBy.user': { $ne: socket.userId }
        },
        {
          $push: {
            readBy: {
              user: socket.userId,
              readAt: new Date()
            }
          }
        }
      );

      // Notify other participants that messages were read
      socket.to(chatId).emit('messages_read', {
        readBy: socket.userId,
        messageIds,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Mark read error:', error);
    }
  });

  // Handle user disconnect
  socket.on('disconnect', (reason) => {
    console.log(`❌ User ${socket.user.username} disconnected (Reason: ${reason})`);
    
    // Only update status for intentional disconnects
    if (reason === 'client namespace disconnect' || reason === 'server namespace disconnect') {
      updateUserOnlineStatus(socket.userId, false);
      notifyFriendsStatusChange(socket.userId, false, io);
    } else {
      console.log(`⚠️ Temporary disconnect for ${socket.user.username}: ${reason}`);
    }
  });

  // Notify friends about online status
  notifyFriendsStatusChange(socket.userId, true, io);
};

// Helper functions
const updateUserOnlineStatus = async (userId, isOnline) => {
  try {
    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: new Date()
    });
  } catch (error) {
    console.error('Update online status error:', error);
  }
};

const joinUserChats = async (socket) => {
  try {
    const chats = await Chat.find({
      participants: socket.userId
    }).select('_id');

    const chatCount = chats.length;
    chats.forEach(chat => {
      socket.join(chat._id.toString());
    });
    
    console.log(`🏠 User ${socket.user.username} joined ${chatCount} chat rooms`);
  } catch (error) {
    console.error('Join user chats error:', error);
  }
};

const notifyFriendsStatusChange = async (userId, isOnline, io) => {
  try {
    const user = await User.findById(userId).populate('friends', '_id');
    
    user.friends.forEach(friend => {
      io.to(friend._id.toString()).emit('friend_status_change', {
        userId,
        isOnline,
        lastSeen: new Date()
      });
    });
  } catch (error) {
    console.error('Notify friends status change error:', error);
  }
};
