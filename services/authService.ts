import axiosInstance from './axiosInstance';

export const authAPI = {
  signIn: async (data: { email: string; password: string }) => {
    const response = await axiosInstance.post('/users/signin', data);
    return response.data;
  },

  signUp: async (data: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    gender?: string;
    dateOfBirth?: string;
    avatar?: string;
    address?: {
      fullAddress?: string;
      ward?: string;
      district?: string;
      city?: string;
      province?: string;
    };
    termsAgreed: boolean;
  }) => {
    const response = await axiosInstance.post('/users/signup', data);
    return response.data;
  },
};
