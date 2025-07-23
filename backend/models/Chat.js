import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  isGroupChat: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    trim: true,
    maxlength: [50, 'Group name cannot exceed 50 characters']
  },
  groupAvatar: {
    type: String,
    default: ''
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatSchema.index({ participants: 1 });
chatSchema.index({ lastActivity: -1 });

export default mongoose.model('Chat', chatSchema);
