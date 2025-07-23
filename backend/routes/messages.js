import express from 'express';
import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get messages for a chat
router.get('/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const messages = await Message.find({ 
      chat: chatId,
      isDeleted: false 
    })
    .populate('sender', 'username fullName avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: req.user._id },
        'readBy.user': { $ne: req.user._id }
      },
      {
        $push: {
          readBy: {
            user: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ 
      messages: messages.reverse(), // Return in chronological order
      page: parseInt(page),
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to get messages' });
  }
});

// Send a message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { chatId, content, messageType = 'text' } = req.body;

    // Verify user is part of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Create message
    const message = new Message({
      sender: req.user._id,
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

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Edit a message
router.put('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findOne({
      _id: messageId,
      sender: req.user._id,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }

    message.content = content;
    message.editedAt = new Date();
    await message.save();
    await message.populate('sender', 'username fullName avatar');

    res.json({ message });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Failed to edit message' });
  }
});

// Delete a message
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      sender: req.user._id
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }

    message.isDeleted = true;
    message.content = 'This message was deleted';
    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
});

export default router;
