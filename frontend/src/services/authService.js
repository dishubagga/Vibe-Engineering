import api from './api';

const authService = {
  async register(email, password, name) {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },
};

export default authService;
