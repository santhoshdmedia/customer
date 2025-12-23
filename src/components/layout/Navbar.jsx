// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  InputBase,
  alpha,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from "../../assets/logo/logo.jpeg"

const Navbar = ({ onDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        width: { md: '100%' },
        ml: { md: 0 },
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        {/* Menu Button for Mobile */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{
            mr: 2,
            display: { xs: 'flex', md: 'none' },
            color: theme.palette.text.primary,
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo/Brand */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          flexGrow: { xs: 1, md: 0 },
          mr: { md: 4 }
        }}>
          <img src={Logo} alt="log"  className='w-32'/>
        </Box>

        {/* Search Bar - Hidden on mobile */}
        {/* {!isMobile && (
          <Box
            sx={{
              position: 'relative',
              borderRadius: theme.shape.borderRadius,
              backgroundColor: alpha(theme.palette.common.black, 0.05),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.black, 0.08),
              },
              mr: 2,
              ml: { md: 2 },
              width: { md: 'auto', lg: '400px' },
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
            }}
          >
            <Box
              sx={{
                padding: theme.spacing(0, 2),
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SearchIcon />
            </Box>
            <InputBase
              placeholder="Search..."
              sx={{
                color: 'inherit',
                width: '100%',
                pl: `calc(1em + ${theme.spacing(4)})`,
                pr: theme.spacing(2),
                py: 1,
              }}
            />
          </Box>
        )} */}

        <Box sx={{ flexGrow: 1 }} />

        {/* Right side icons */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 2 }
        }}>
          {/* Search Button for Mobile */}
          {/* {isMobile && (
            <IconButton color="inherit" size="small">
              <SearchIcon />
            </IconButton>
          )} */}

          {/* Notifications */}
          {/* <IconButton
            color="inherit"
            onClick={handleNotificationsOpen}
            size={isMobile ? 'small' : 'medium'}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton> */}

          {/* Notifications Menu */}
          {/* <Menu
            anchorEl={notificationsAnchor}
            open={Boolean(notificationsAnchor)}
            onClose={handleNotificationsClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleNotificationsClose}>
              <Typography variant="body2">New lead assigned</Typography>
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              <Typography variant="body2">System update available</Typography>
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              <Typography variant="body2">Meeting in 30 minutes</Typography>
            </MenuItem>
          </Menu> */}

          {/* User Menu */}
          {isMobile ? (
            <IconButton onClick={handleMenuOpen} size="small">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: theme.palette.primary.main,
                  fontSize: '0.875rem',
                }}
              >
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          ) : (
            <Button
              onClick={handleMenuOpen}
              startIcon={
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: theme.palette.primary.main,
                    fontSize: '0.875rem',
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Avatar>
              }
              sx={{
                textTransform: 'none',
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <Box sx={{ textAlign: 'left', ml: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1 }}>
                  {user?.name || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {user?.role?.replace('_', ' ') || 'No role'}
                </Typography>
              </Box>
            </Button>
          )}

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                boxShadow: theme.shadows[8],
              },
            }}
          >
           
            <MenuItem onClick={handleSettings}>
              <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;