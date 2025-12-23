// src/services/lead.service.js
import api from './api';
export const getCustomUser = async () =>
  await custom_request.get(`${BASE_URL}/client_user/get_all_custom_users`);


export const userService = {
  getAllUser: () => api.get(`/client_user/get_all_custom_users`, ),
  updateUserStatus: (id, data) => api.put(`/client_user/update_client_user/${id}`, data),
};