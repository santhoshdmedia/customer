// src/components/layout/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { 
  Box, 
  Toolbar, 
  CssBaseline, 
  useTheme, 
  useMediaQuery,
  Container
} from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Auto-close mobile sidebar when route changes
  useEffect(() => {
    if (mobileOpen && isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile, mobileOpen]);

  // Reset sidebar collapse on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isMobile) {
        setSidebarCollapsed(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Don't show sidebar/navbar for non-authenticated pages
  if (!user) {
    return (
      <Box sx={{ 
        display: 'flex', 
        width: '100%', 
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <CssBaseline />
        <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
          <Outlet />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      width: '100%', 
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      <CssBaseline />
      <Navbar onDrawerToggle={handleDrawerToggle} />
      <Sidebar
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={toggleSidebarCollapsed}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: { 
            md: sidebarCollapsed ? '73px' : '240px' 
          },
          width: { 
            md: sidebarCollapsed ? 'calc(100% - 73px)' : 'calc(100% - 240px)' 
          },
        }}
      >
        <Toolbar sx={{ 
          minHeight: { xs: 56, sm: 64, md: 72 } 
        }} />
        <Container 
          maxWidth={false} 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: '100% !important',
            px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }
          }}
        >
          {/* Use key prop to prevent unwanted remounts */}
          <Outlet key={location.pathname} />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;