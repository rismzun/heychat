import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('Socket authentication failed: No token provided');
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('Socket authentication failed: Invalid token - user not found');
      return next(new Error('Authentication error: Invalid token'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    console.log(`Socket authenticated for user: ${user.username}`);
    next();
  } catch (error) {
    console.error('Socket auth error:', error.message);
    if (error.name === 'TokenExpiredError') {
      next(new Error('Authentication error: Token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new Error('Authentication error: Invalid token'));
    } else {
      next(new Error('Authentication error: Server error'));
    }
  }
};
