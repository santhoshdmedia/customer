import api from './api';

export const customerCareService = {
  // Get all customer care users
  getAllUsers: async () => {
    try {
      const response = await api.get('/customer-care');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/customer-care/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post('/customer-care', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/customer-care/update_customerCare/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/customer-care/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search users
  searchUsers: async (searchTerm) => {
    try {
      const response = await api.get(`/customer-care/search?q=${searchTerm}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bulk update users
  bulkUpdateUsers: async (userIds, updateData) => {
    try {
      const response = await api.put('/customer-care/bulk-update', {
        userIds,
        ...updateData
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async (id) => {
    try {
      const response = await api.get(`/customer-care/${id}/stats`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Export users
  exportUsers: async (format = 'excel') => {
    try {
      const response = await api.get(`/customer-care/export?format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
