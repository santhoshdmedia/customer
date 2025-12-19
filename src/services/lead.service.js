// src/services/lead.service.js
import api from './api';

export const leadService = {
  createLead: (data) => api.post('/Lead', data),
  updateLead: (id, data) => api.post(`/Lead/${id}`, data),
  getAllLeads: (params) => api.get(`/Lead`, { params }),
  getLeadBymemberId: (id) => api.get(`/Lead/member/${id}`),
  getLeadById: (id) => api.get(`/Lead/${id}`),
  getLeadsStatistics: (id) => api.get(`/Lead/dashboard/${id}`),
  updateLeadStatus: (id, data) => api.patch(`/Lead/${id}/status`, data),

  getCallbacks: (type = 'today', memberId) => {
    if (memberId) {
      return api.get(`/Lead/callbacks/${memberId}`, { params: { type } });
    }
    return api.get('/Lead/callbacks', { params: { type } });
  },
  
  deleteLead: (id) => api.delete(`/Lead/${id}`),

  getDashboardStats: (memberId) => {
    if (memberId) {
      return api.get(`/Lead/dashboard/${memberId}`);
    }
    return api.get('/Lead/dashboard');
  },

  getPrioritizedLeads: (memberId, limit = 10) => {
    // Note: This endpoint doesn't exist in your backend yet
    // You'll need to add it or use existing endpoints
    console.warn('getPrioritizedLeads endpoint not implemented yet');
    return api.get('/Lead', { params: { limit, memberId } });
  },

  assignMember: (id, memberId) =>
    api.patch(`/Lead/${id}/assign`, { Assign_member: memberId }),
  assignMultipleLeads: (data) =>
    api.post(`/Lead/assign-multiple`, data),

  getLeadsByStatus: (memberId, status, page = 1, limit = 10) =>
    api.get(`/Lead/status/${memberId}`, {
      params: { status, page, limit }
    }),

  rescheduleCallback: (id, callback_time, notes) =>
    api.patch(`/Lead/${id}/reschedule`, { callback_time, notes }),

  getLeadCallHistory: (id) => api.get(`/Lead/${id}/call-history`)
};