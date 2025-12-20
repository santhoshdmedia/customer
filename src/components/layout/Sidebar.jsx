// src/components/layout/Sidebar.jsx
import React from 'react';
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
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  PhoneCallback as CallbackIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const adminMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['admin', 'manager', 'agent'] },
  { text: 'Leads', icon: <PeopleIcon />, path: '/leads', roles: ['admin', 'manager', 'agent'] },
  { text: 'Customer Care', icon: <AssignmentIcon />, path: '/customer-care', roles: ['admin', 'manager'] },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['admin', 'manager'] },
];

const customerCareMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Leads', icon: <PeopleIcon />, path: '/leads' },
  { text: 'Callbacks', icon: <CallbackIcon />, path: '/callbacks' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const agentMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Leads', icon: <PeopleIcon />, path: '/leads' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = ({ mobileOpen, onDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get menu items based on user role
  const getMenuItems = () => {
    if (!user || !user.role) {
      return customerCareMenuItems; // Default fallback
    }

    switch (user.role) {
      case 'customer_care':
        return customerCareMenuItems;
      case 'agent':
        return agentMenuItems;
      case 'admin':
      case 'manager':
        return adminMenuItems.filter(item => item.roles.includes(user.role));
      default:
        return customerCareMenuItems;
    }
  };

  const menuItems = getMenuItems();

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      <Divider />
      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile && onDrawerToggle) {
                onDrawerToggle();
              }
            }}
            selected={location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)}
            sx={{
              mb: 1,
              borderRadius: 1,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              },
              '&:hover': {
                backgroundColor: 'action.hover',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: location.pathname.startsWith(item.path) ? 'inherit' : 'text.secondary' 
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontWeight: location.pathname.startsWith(item.path) ? 600 : 400
              }}
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ 
        p: 2, 
        borderTop: 1, 
        borderColor: 'divider',
        backgroundColor: 'background.default'
      }}>
        {user ? (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary' }}>
              {user.name || user.email}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Role: {user.role || 'Not assigned'}
            </Typography>
          </>
        ) : (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            User information not available
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ 
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;