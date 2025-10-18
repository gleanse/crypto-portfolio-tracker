import api from './axiosConfig';

export const holdingsApi = {
  getMyPortfolio: async () => {
    const response = await api.get('/portfolio/');
    return response.data;
  },

  addHolding: async (holdingData) => {
    const response = await api.post('/portfolio/', holdingData);
    return response.data;
  },

  deleteHolding: async (holdingId) => {
    const response = await api.delete(`/portfolio/${holdingId}`);
    return response.data;
  },

  getPortfolioStats: async () => {
    const response = await api.get('/portfolio/stats');
    return response.data;
  },
};
