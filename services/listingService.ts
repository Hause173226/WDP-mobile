import axiosInstance from './axiosInstance';

export const listingService = {
  getListings: async (
    params: Record<string, string | number | undefined | null>
  ) => {
    const response = await axiosInstance.get('/listings', { params });
    return response.data;
  },

  getListingById: async (id: string) => {
    const response = await axiosInstance.get(`/listings/${id}`);
    return response.data;
  },

  getMyListing: async (listingId: string) => {
    const response = await axiosInstance.get(`/listings/mine/${listingId}`);
    return response.data;
  },

  deletePhoto: async (listingId: string, publicId: string) => {
    const response = await axiosInstance.delete(
      `/listings/${listingId}/photos/${encodeURIComponent(publicId)}`
    );
    return response.data;
  },

  updateListing: async (listingId: string, formData: FormData) => {
    const response = await axiosInstance.patch(
      `/listings/${listingId}`,
      formData
    );
    return response.data;
  },

  createListing: async (formData: FormData) => {
    const response = await axiosInstance.post('/listings', formData);
    return response.data;
  },

  submitForReview: async (listingId: string) => {
    const response = await axiosInstance.post(`/listings/${listingId}/submit`, {
      commissionTermsAccepted: true,
    });
    return response.data;
  },
};
