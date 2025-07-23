import React, { useState } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  Chat
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';

const AuthPage = () => {
  const theme = useTheme();
  const { login, register } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loginForm = useForm();
  const registerForm = useForm();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    loginForm.reset();
    registerForm.reset();
  };

  const handleLogin = async (data) => {
    setLoading(true);
    setError('');

    const result = await login({
      login: data.login,
      password: data.password
    });

    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleRegister = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    const result = await register({
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      password: data.password
    });

    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  const LoginForm = () => (
    <Box component="form" onSubmit={loginForm.handleSubmit(handleLogin)} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Email or Username"
        variant="outlined"
        margin="normal"
        {...loginForm.register('login', { required: 'Email or username is required' })}
        error={!!loginForm.formState.errors.login}
        helperText={loginForm.formState.errors.login?.message}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person color="action" />
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        variant="outlined"
        margin="normal"
        {...loginForm.register('password', { required: 'Password is required' })}
        error={!!loginForm.formState.errors.password}
        helperText={loginForm.formState.errors.password?.message}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ mt: 3, mb: 2, py: 1.5 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Sign In'}
      </Button>
    </Box>
  );

  const RegisterForm = () => (
    <Box component="form" onSubmit={registerForm.handleSubmit(handleRegister)} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Full Name"
        variant="outlined"
        margin="normal"
        {...registerForm.register('fullName', { 
          required: 'Full name is required',
          minLength: { value: 2, message: 'Full name must be at least 2 characters' }
        })}
        error={!!registerForm.formState.errors.fullName}
        helperText={registerForm.formState.errors.fullName?.message}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person color="action" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Username"
        variant="outlined"
        margin="normal"
        {...registerForm.register('username', { 
          required: 'Username is required',
          minLength: { value: 3, message: 'Username must be at least 3 characters' },
          pattern: {
            value: /^[a-zA-Z0-9_]+$/,
            message: 'Username can only contain letters, numbers, and underscores'
          }
        })}
        error={!!registerForm.formState.errors.username}
        helperText={registerForm.formState.errors.username?.message}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              @
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Email"
        type="email"
        variant="outlined"
        margin="normal"
        {...registerForm.register('email', { 
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        })}
        error={!!registerForm.formState.errors.email}
        helperText={registerForm.formState.errors.email?.message}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email color="action" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        variant="outlined"
        margin="normal"
        {...registerForm.register('password', {
          required: 'Password is required',
          minLength: { value: 6, message: 'Password must be at least 6 characters' }
        })}
        error={!!registerForm.formState.errors.password}
        helperText={registerForm.formState.errors.password?.message}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        variant="outlined"
        margin="normal"
        {...registerForm.register('confirmPassword', { required: 'Please confirm your password' })}
        error={!!registerForm.formState.errors.confirmPassword}
        helperText={registerForm.formState.errors.confirmPassword?.message}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ mt: 3, mb: 2, py: 1.5 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Create Account'}
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="sm" sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      py: 4
    }}>
      <Paper 
        elevation={0}
        sx={{ 
          width: '100%',
          p: 4,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2
        }}
      >
        {/* Logo and Title */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 2
          }}>
            <Chat 
              sx={{ 
                fontSize: 40, 
                color: theme.palette.primary.main,
                mr: 1
              }} 
            />
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              HeyChat
            </Typography>
          </Box>
          <Typography variant="body1" color="textSecondary">
            Connect with friends and chat in real-time
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500
              }
            }}
          >
            <Tab label="Sign In" />
            <Tab label="Create Account" />
          </Tabs>
        </Box>

        {/* Forms */}
        {tabValue === 0 ? <LoginForm /> : <RegisterForm />}
      </Paper>
    </Container>
  );
};

export default AuthPage;
