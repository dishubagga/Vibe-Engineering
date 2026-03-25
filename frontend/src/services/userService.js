import api from './api';

const userService = {
  async getMe() {
    const response = await api.get('/users/me');
    return response.data.data;
  },

  async updateProfile(data) {
    const response = await api.put('/users/me', data);
    return response.data.data;
  },

  async completeOnboarding(data) {
    const response = await api.post('/users/me/onboarding', data);
    return response.data;
  },
};

export default userService;
