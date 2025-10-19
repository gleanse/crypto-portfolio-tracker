import api from './axiosConfig';

export const userApi = {
  getCurrentUser: async () => {
    const response = await api.get('/users/me/dashboard');
    return response.data;
  },

  getUserProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateUserProfile: async (userData) => {
    const response = await api.patch('/users/me', userData);
    return response.data;
  },
};
