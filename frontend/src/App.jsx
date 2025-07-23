import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AuthPage from './components/AuthPage';
import ChatLayout from './components/ChatLayout';
import LoadingScreen from './components/LoadingScreen';

const AppContent = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <ChatLayout /> : <AuthPage />;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <AppContent />
          </SocketProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;

