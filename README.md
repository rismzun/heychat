# HeyChat - Real-time Chat Application

A modern, Instagram-like real-time chat application built with React, Node.js, Socket.IO, and MongoDB.

## Features

### 🚀 Core Functionality
- **Real-time messaging** with Socket.IO
- **User authentication** with JWT and bcrypt
- **Friend system** - Add friends using usernames
- **Online status** indicators
- **Typing indicators**
- **Message read receipts**

### 🎨 User Interface
- **Instagram-like design** - Clean, modern interface
- **Responsive design** - Works on desktop and mobile
- **Dark/Light theme** switching
- **Material-UI components** for consistent design
- **Smooth animations** and transitions

### 🔒 Security
- **JWT authentication**
- **Password hashing** with bcrypt + salt
- **Input validation** and sanitization
- **Protected routes** and API endpoints

## Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Material-UI (MUI)** - Component library
- **Socket.IO Client** - Real-time communication
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hook Form** - Form handling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd heychat
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file with your configuration
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start the backend server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start the frontend development server
npm run dev
```

### 4. Database Setup
Make sure MongoDB is running on your system or configure the connection string in `.env` file.

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/heychat
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12
```

## Usage

1. **Registration**: Create a new account with username, email, and password
2. **Login**: Sign in with email/username and password
3. **Add Friends**: Search for users by username and send friend requests
4. **Start Chatting**: Select a friend from the sidebar to start a conversation
5. **Real-time Features**: See online status, typing indicators, and receive messages instantly

## Project Structure

```
heychat/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── sockets/         # Socket.IO handlers
│   └── server.js        # Main server file
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   ├── context/     # React context providers
    │   ├── theme/       # Material-UI themes
    │   └── App.jsx      # Main App component
    └── public/          # Static files
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users
- `POST /api/users/friend-request` - Send friend request
- `POST /api/users/accept-friend` - Accept friend request
- `GET /api/users/friends` - Get friends list

### Chats
- `GET /api/chats` - Get user's chats
- `POST /api/chats/create` - Create/get chat
- `GET /api/chats/:chatId` - Get specific chat

### Messages
- `GET /api/messages/:chatId` - Get chat messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:messageId` - Edit message
- `DELETE /api/messages/:messageId` - Delete message

## Socket.IO Events

### Client to Server
- `join_chat` - Join a chat room
- `leave_chat` - Leave a chat room
- `send_message` - Send a message
- `typing` - Typing indicator
- `mark_read` - Mark messages as read

### Server to Client
- `new_message` - New message received
- `user_typing` - User typing indicator
- `messages_read` - Messages marked as read
- `friend_status_change` - Friend online/offline status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Acknowledgments

- Inspired by Instagram's chat interface
- Built with modern web technologies
- Designed for scalability and performance
