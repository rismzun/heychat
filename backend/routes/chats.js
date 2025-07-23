import express from 'express';
import Chat from '../models/Chat.js';
import message from '../models/Message.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all chats for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'username fullName avatar isOnline lastSeen')
    .populate('lastMessage')
    .sort({ lastActivity: -1 });

    res.json({ chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Failed to get chats' });
  }
});

// Create or get existing chat with another user
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { participantId } = req.body;

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, participantId] },
      isGroupChat: false
    }).populate('participants', 'username fullName avatar isOnline lastSeen');

    if (chat) {
      return res.json({ chat });
    }

    // Create new chat
    chat = new Chat({
      participants: [req.user._id, participantId],
      isGroupChat: false
    });

    await chat.save();
    await chat.populate('participants', 'username fullName avatar isOnline lastSeen');

    res.status(201).json({ chat });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Failed to create chat' });
  }
});

// Get chat by ID
router.get('/:chatId', authenticateToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user._id
    }).populate('participants', 'username fullName avatar isOnline lastSeen');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json({ chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Failed to get chat' });
  }
});

export default router;
