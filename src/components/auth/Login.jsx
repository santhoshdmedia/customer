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
  CircularProgress,
  IconButton,
  InputAdornment,
  Grid,
  Fade,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Login as LoginIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
      
      const result = await login(email, password);

      if (result) {
        toast.success(result.message || 'Welcome back!');
        navigate('/dashboard');
      } else {
        setError(result?.message || 'Invalid credentials');
        toast.error(result?.message || 'Invalid credentials');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setError(`Login failed: ${error.message || 'Please check your connection'}`);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const useTestCredentials = () => {
    setEmail('admin@example.com');
    setPassword('password123');
    toast.success('Test credentials loaded!');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '300%',
          height: '300%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'moveBackground 20s linear infinite',
          opacity: 0.3,
        }
      }}
    >
      <style>
        {`
          @keyframes moveBackground {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-50px, -50px); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>

      <Container maxWidth="lg">
        <Grid container justifyContent="center" alignItems="center">
          <Grid item xs={12} md={6} lg={5}>
            <Fade in={true} timeout={800}>
              <Paper
                elevation={24}
                sx={{
                  p: isMobile ? 3 : 4,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  }
                }}
              >
                {/* Decorative elements */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                    animation: 'float 6s ease-in-out infinite',
                  }}
                />
                
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, rgba(118, 75, 162, 0.1), rgba(102, 126, 234, 0.1))',
                    animation: 'float 4s ease-in-out infinite',
                    animationDelay: '1s',
                  }}
                />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  {/* Header */}
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        mb: 2,
                        animation: 'float 4s ease-in-out infinite',
                      }}
                    >
                      <LockIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    
                    <Typography
                      variant="h4"
                      component="h1"
                      gutterBottom
                      sx={{
                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 700,
                        fontSize: isMobile ? '1.75rem' : '2.125rem',
                      }}
                    >
                      Customer Care Portal
                    </Typography>
                    
                    
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 0.5,
                        borderRadius: 20,
                        background: 'rgba(102, 126, 234, 0.1)',
                        mb: 3,
                      }}
                    >
                      <AdminIcon fontSize="small" color="primary" />
                      <Typography variant="caption" color="primary.main" fontWeight={600}>
                        Admin Panel
                      </Typography>
                    </Box>
                  </Box>

                  {error && (
                    <Alert
                      severity="error"
                      sx={{
                        mb: 3,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'error.light',
                        background: 'rgba(211, 47, 47, 0.05)',
                        animation: 'shake 0.5s ease-in-out',
                      }}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        {error}
                      </Typography>
                    </Alert>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        autoComplete="email"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s',
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                              boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                              boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            fontWeight: 500,
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 4 }}>
                      <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        autoComplete="current-password"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                edge="end"
                                sx={{ color: 'primary.main' }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s',
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                              boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                              boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            fontWeight: 500,
                          },
                        }}
                      />
                    </Box>

                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={!loading && <LoginIcon />}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                          background: 'linear-gradient(90deg, #764ba2, #667eea)',
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        },
                        '&:disabled': {
                          background: 'linear-gradient(90deg, #ccc, #999)',
                          boxShadow: 'none',
                          transform: 'none',
                        },
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Sign In to Dashboard'
                      )}
                    </Button>

                 
                  </form>

                
                </Box>
              </Paper>
            </Fade>
          </Grid>

          {/* Right side info panel - hidden on mobile */}
         
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;