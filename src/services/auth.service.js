// src/services/auth.service.js
import api from './api';
import { jwtDecode } from 'jwt-decode';

export const authService = {
  login: async (email, password) => {
    try {
      console.log('API Base URL:', api.defaults.baseURL);
      console.log('Attempting login to:', `${api.defaults.baseURL}/customer-care/login`);
      
      const response = await api.post('/customer-care/login', { email, password });
      console.log('Login response:', response.data);
      
      // FIX: Your response structure is { token, user } not { data: { token, user } }
      if (response.data) {
        const userData = response.data.data.user;
        const token = response.data.data.token;
        
        console.log('Token from response:', token);
        console.log('User data from response:', userData);
        
        // Store user info (without password)
        const userToStore = {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          phone: userData.phone
        };
        
        localStorage.setItem('user', JSON.stringify(userToStore));
        localStorage.setItem('token', token);
        
        return {
          success: true,
          message: 'Login successful',
          data: {
            user: userToStore,
            token: token
          }
        };
      } else {
        throw new Error('Login failed: No data received');
      }
    } catch (error) {
      console.error('Login error details:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      console.log('getCurrentUser - localStorage user:', userStr);
      
      if (!userStr || userStr === 'null' || userStr === 'undefined') {
        return null;
      }
      
      const user = JSON.parse(userStr);
      console.log('getCurrentUser - parsed user:', user);
      return user;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  },

  getToken: () => {
    const token = localStorage.getItem('token');
    console.log('getToken - token from localStorage:', token);
    return token;
  },

  isAuthenticated: () => {
    const token = authService.getToken();
    if (!token) {
      console.log('isAuthenticated: No token found');
      return false;
    }
    
    try {
      const decoded = jwtDecode(token);
   
      console.log('isAuthenticated: Token valid');
      return true;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  },

  getUserRole: () => {
    const user = authService.getCurrentUser();
    console.log('getUserRole - user:', user);
    return user ? user.role : null;
  }
};