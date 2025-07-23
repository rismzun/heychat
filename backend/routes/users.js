import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        fullName: req.user.fullName,
        avatar: req.user.avatar,
        bio: req.user.bio,
        isOnline: req.user.isOnline,
        lastSeen: req.user.lastSeen
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, bio, avatar } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, bio, avatar },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Search users by username
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      username: { $regex: q, $options: 'i' },
      _id: { $ne: req.user._id } // Exclude current user
    })
    .select('username fullName avatar bio isOnline lastSeen')
    .limit(20);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Failed to search users' });
  }
});

// Send friend request
router.post('/friend-request', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;
    
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if already friends
    if (req.user.friends.includes(targetUser._id)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    // Check if request already sent
    if (req.user.friendRequests.sent.includes(targetUser._id)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Check if received request from this user
    if (req.user.friendRequests.received.includes(targetUser._id)) {
      return res.status(400).json({ message: 'This user has already sent you a friend request' });
    }

    // Add to sent requests for current user
    await User.findByIdAndUpdate(req.user._id, {
      $push: { 'friendRequests.sent': targetUser._id }
    });

    // Add to received requests for target user
    await User.findByIdAndUpdate(targetUser._id, {
      $push: { 'friendRequests.received': req.user._id }
    });

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Failed to send friend request' });
  }
});

// Accept friend request
router.post('/accept-friend', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    
    const requestUser = await User.findById(userId);
    if (!requestUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if friend request exists
    if (!req.user.friendRequests.received.includes(userId)) {
      return res.status(400).json({ message: 'No friend request from this user' });
    }

    // Add to friends list for both users
    await User.findByIdAndUpdate(req.user._id, {
      $push: { friends: userId },
      $pull: { 'friendRequests.received': userId }
    });

    await User.findByIdAndUpdate(userId, {
      $push: { friends: req.user._id },
      $pull: { 'friendRequests.sent': req.user._id }
    });

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Failed to accept friend request' });
  }
});

// Reject friend request
router.post('/reject-friend', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;

    // Remove from received requests for current user
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { 'friendRequests.received': userId }
    });

    // Remove from sent requests for other user
    await User.findByIdAndUpdate(userId, {
      $pull: { 'friendRequests.sent': req.user._id }
    });

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ message: 'Failed to reject friend request' });
  }
});

// Get friends list
router.get('/friends', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'username fullName avatar bio isOnline lastSeen')
      .populate('friendRequests.received', 'username fullName avatar bio')
      .populate('friendRequests.sent', 'username fullName avatar bio');

    res.json({
      friends: user.friends,
      receivedRequests: user.friendRequests.received,
      sentRequests: user.friendRequests.sent
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Failed to get friends list' });
  }
});

export default router;
