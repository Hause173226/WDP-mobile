import axiosInstance from './axiosInstance';

export const vehicleService = {
  getListingDetail: async (listingId: string) => {
    const response = await axiosInstance.get(`/listings/${listingId}`);
    return response.data;
  },

  getChatForListing: async (listingId: string) => {
    const response = await axiosInstance.get(`/chat/listing/${listingId}`);
    return response.data;
  },

  createDeposit: async (payload: {
    listingId: string;
    depositAmount: number;
  }) => {
    const response = await axiosInstance.post('/deposits', payload);
    return response.data;
  },
};
