import api from './api';

const customerCareSettingsService = {
  // Get user settings
  getMySettings: async () => {
    try {
      const response = await api.get('/customer-care-settings/my-settings');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user settings
  updateSettings: async (settings) => {
    try {
      const response = await api.put('/customer-care-settings/my-settings', settings);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update section settings
  updateSection: async (section, data) => {
    try {
      const response = await api.put('/customer-care-settings/my-settings/section', { section, data });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset settings to default
  resetSettings: async () => {
    try {
      const response = await api.post('/customer-care-settings/my-settings/reset');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Export settings
  exportSettings: async (format = 'json') => {
    try {
      const response = await api.get(`/customer-care-settings/my-settings/export?format=${format}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check availability
  checkAvailability: async () => {
    try {
      const response = await api.get('/customer-care-settings/my-settings/availability');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Get global settings
  getGlobalSettings: async () => {
    try {
      const response = await api.get('/customer-care-settings/global');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Update global settings
  updateGlobalSettings: async (settings) => {
    try {
      const response = await api.put('/customer-care-settings/global', settings);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default customerCareSettingsService;