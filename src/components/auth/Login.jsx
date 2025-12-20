// src/components/auth/Login.jsx - Updated
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Clear localStorage on mount
  useEffect(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Clear any previous data
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    try {
      console.log('Login attempt with:', { email, password });
      
      // Test the endpoint first
      const testUrl = 'https://printe.in/api/customer-care/login';
      console.log('Testing URL:', testUrl);
      
      const testResponse = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('Test response status:', testResponse.status);
      const testData = await testResponse.json();
      console.log('Test response data:', testData);
      
      // Now use auth service
     // In handleSubmit function
const result = await login(email, password);

if (result ) {
  toast.success(result.message || 'Login successful!');
  navigate('/dashboard');
} else {
  setError(result?.message || 'Login failed');
  toast.error(result?.message || 'Login failed');
}
      
    
    } catch (error) {
      console.error('Full error:', error);
      setError(`Login error: ${error.message || 'Check backend connection'}`);
      toast.error('Login failed. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  // Use test credentials
  const useTestCredentials = () => {
    setEmail('admin@example.com');
    setPassword('password123');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LockIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" component="h1" gutterBottom>
              Customer Care Portal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Backend: https://printe.in
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              autoComplete="email"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              autoComplete="current-password"
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={useTestCredentials}
              sx={{ mb: 2 }}
            >
              Use Test Credentials
            </Button>

            <Typography variant="body2" color="text.secondary" align="center">
              Test: admin@example.com / password123
            </Typography>
            
            <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 1, display: 'block' }}>
              Backend running on: https://printe.in
            </Typography>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;