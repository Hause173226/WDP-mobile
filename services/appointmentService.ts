import axiosInstance from './axiosInstance';

export interface Appointment {
  _id: string;
  auctionId?: string;
  appointmentType: 'AUCTION' | 'DEPOSIT' | 'OTHER';
  buyerId: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  sellerId: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  scheduledDate: string;
  location: string;
  status: 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED';
  type: 'CONTRACT_SIGNING' | 'INSPECTION' | 'OTHER';
  notes?: string;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  buyerConfirmedAt?: string;
  sellerConfirmedAt?: string;
  confirmedAt?: string;
  rescheduledCount: number;
  maxReschedules: number;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentResponse {
  success: boolean;
  message: string;
  appointment: Appointment;
}

export interface AppointmentListResponse {
  success: boolean;
  data?: Appointment[];
  appointments?: Appointment[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Winner APIs
export const appointmentService = {
  createFromAuction: async (
    auctionId: string,
    payload?: {
      scheduledDate?: string;
      location?: string;
      notes?: string;
    }
  ): Promise<CreateAppointmentResponse> => {
    const response = await axiosInstance.post(
      `/appointments/auction/${auctionId}`,
      payload || {}
    );
    return response.data;
  },

  // Buyer & Seller APIs
  confirm: (appointmentId: string) =>
    axiosInstance.post(`/appointments/${appointmentId}/confirm`),

  reject: (appointmentId: string, reason?: string) =>
    axiosInstance.post(`/appointments/${appointmentId}/reject`, { reason }),

  cancel: (appointmentId: string, reason?: string) =>
    axiosInstance.put(`/appointments/${appointmentId}/cancel`, { reason }),

  getUserAppointments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await axiosInstance.get('/appointments/user', { params });
    return response.data;
  },

  getAuctionAppointments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await axiosInstance.get('/appointments/auction/list', {
      params,
    });
    return response.data;
  },

  getById: async (appointmentId: string) => {
    const response = await axiosInstance.get(`/appointments/${appointmentId}`);
    return response.data;
  },

  getContract: async (appointmentId: string) => {
    const response = await axiosInstance.get(`/contracts/${appointmentId}`);
    return response.data;
  },

  uploadContractPhotos: (appointmentId: string, formData: FormData) =>
    axiosInstance.post(`/contracts/${appointmentId}/upload-photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  completeTransaction: (appointmentId: string) =>
    axiosInstance.post(`/contracts/${appointmentId}/complete`),

  getStaffAppointments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await axiosInstance.get('/appointments/staff', { params });
    return response.data;
  },
};
