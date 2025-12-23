// src/components/layout/Sidebar.jsx
import React, { useMemo } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
  useMediaQuery,
  useTheme,
  Typography,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Group as GroupIcon,
  Call as CallIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;
const collapsedDrawerWidth = 73;

const menuItemsByRole = {
  admin: [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Leads', icon: <PeopleIcon />, path: '/leads' },
    { text: 'Agents', icon: <GroupIcon />, path: '/agents' },
    { text: 'Customer Care', icon: <AssignmentIcon />, path: '/customer-care' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'Companies', icon: <BusinessIcon />, path: '/companies' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ],
  manager: [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Leads', icon: <PeopleIcon />, path: '/leads' },
    { text: 'Customer Care', icon: <AssignmentIcon />, path: '/customer-care' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ],
  customer_care: [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Leads', icon: <PeopleIcon />, path: '/leads' },
    { text: 'Users', icon: <GroupIcon />, path: '/users' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ],
};

const Sidebar = ({ mobileOpen, onDrawerToggle, collapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = useMemo(() => {
    if (!user?.role) return [];
    return menuItemsByRole[user.role] || [];
  }, [user?.role]);

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const drawerContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflowX: 'hidden'
    }}>
      {/* Collapse toggle button */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'flex-end',
        p: 2,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        {!isMobile && (
          <IconButton onClick={() => {}} size="small">
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ 
        flexGrow: 1, 
        px: collapsed ? 1 : 2,
        py: 2,
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: theme.palette.grey[100],
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.grey[400],
          borderRadius: '3px',
        },
      }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem
              key={item.text}
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  onDrawerToggle();
                }
              }}
              sx={{
                mb: 1,
                borderRadius: 2,
                px: collapsed ? 1.5 : 2,
                py: 1.25,
                backgroundColor: active ? theme.palette.primary.light : 'transparent',
                color: active ? theme.palette.primary.main : 'text.secondary',
                '&:hover': {
                  backgroundColor: active ? theme.palette.primary.light : theme.palette.action.hover,
                },
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minHeight: collapsed ? 48 : 56,
                justifyContent: collapsed ? 'center' : 'flex-start',
                flexDirection: collapsed ? 'column' : 'row',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 'auto' : 40,
                  color: active ? theme.palette.primary.main : 'inherit',
                  mr: collapsed ? 0 : 2,
                  mb: collapsed ? 0.5 : 0,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 400,
                    whiteSpace: 'nowrap',
                  }}
                />
              )}
              {collapsed && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.7rem',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    mt: 0.5,
                  }}
                >
                  {item.text}
                </Typography>
              )}
            </ListItem>
          );
        })}
      </List>

      {/* User Info Section */}
      {!collapsed && (
        <>
          <Divider />
          <Box sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            backgroundColor: theme.palette.background.paper
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  mr: 1.5,
                  backgroundColor: theme.palette.primary.main,
                }}
              >
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ overflow: 'hidden' }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.name || user?.email || 'User'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    textTransform: 'capitalize',
                  }}
                >
                  {user?.role?.replace('_', ' ') || 'No role'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </>
      )}

      {/* Collapsed user info */}
      {collapsed && (
        <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              margin: 'auto',
              backgroundColor: theme.palette.primary.main,
            }}
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </Avatar>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[8],
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: collapsed ? collapsedDrawerWidth : drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
            overflowX: 'hidden',
            boxShadow: 'none',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;