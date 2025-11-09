import axiosInstance from './axiosInstance';

export const authAPI = {
  signIn: async (data: { email: string; password: string }) => {
    const response = await axiosInstance.post('/users/signin', data);
    return response.data;
  },
};
