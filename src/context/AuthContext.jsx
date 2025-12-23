// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state from storage
  const initializeAuth = useCallback(async () => {
    if (initialized) return;
    
    setLoading(true);
    try {
      const isAuth = authService.isAuthenticated();
      
      if (isAuth) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          console.log('AuthContext: User loaded from storage', currentUser);
          setUser(currentUser);
        } else {
          // Token exists but no user data - clear invalid auth
          console.warn('AuthContext: Token exists but no user data, clearing');
          authService.logout();
        }
      }
    } catch (error) {
      console.error('AuthContext: Error initializing auth', error);
      authService.logout();
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [initialized]);

  // Run initialization once on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = useCallback(async (email, password) => {
    try {
      console.log('AuthContext: Attempting login');
      const response = await authService.login(email, password);
      
      if (response && response.data) {
        console.log('AuthContext: Login successful', response.data);
        
        // Set user state
        setUser(response.data);
        
        // Immediately refresh the page after 2 seconds
        setTimeout(() => {
          console.log('AuthContext: Refreshing page after login');
          window.location.reload();
        }, 1000);
        
        return { success: true, data: response.data };
      }
      return { 
        success: false, 
        error: 'Invalid server response' 
      };
    } catch (error) {
      console.error('AuthContext: Login error', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  }, []);

  const logout = useCallback(() => {
    console.log('AuthContext: Logging out');
    setUser(null);
    authService.logout();
    // Reset initialized to false on logout
    setInitialized(false);
  }, []);

  const value = React.useMemo(() => ({
    user,
    login,
    logout,
    isAuthenticated: authService.isAuthenticated(),
    getUserRole: authService.getUserRole,
    loading,
    initialized
  }), [user, login, logout, loading, initialized]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};