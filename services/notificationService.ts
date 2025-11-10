import axiosInstance from './axiosInstance';

export type DepositAction = 'CONFIRM' | 'REJECT';

export interface AppointmentFormPayload {
  depositRequestId: string;
  scheduledDate: string; // ISO string with zone, e.g. 2025-10-30T14:30:00+07:00
  location: string;
  notes?: string;
}

export const notificationService = {
  getNotifications: async () => {
    const response = await axiosInstance.get('/notifications');
    return response.data;
  },

  deleteNotification: async (notificationId: string) => {
    const response = await axiosInstance.delete(
      `/notifications/${notificationId}`
    );
    return response.data;
  },

  confirmDeposit: async (depositId: string, action: DepositAction) => {
    const response = await axiosInstance.post(
      `/deposits/${depositId}/confirm`,
      { action }
    );
    return response.data;
  },

  acceptAppointment: async (appointmentId: string) => {
    const response = await axiosInstance.post(
      `/appointments/${appointmentId}/confirm`
    );
    return response.data;
  },

  rejectAppointment: async (
    appointmentId: string,
    payload: { reason: string }
  ) => {
    const response = await axiosInstance.post(
      `/appointments/${appointmentId}/reject`,
      payload
    );
    return response.data;
  },

  cancelAppointment: async (
    appointmentId: string,
    payload: { reason?: string }
  ) => {
    const response = await axiosInstance.put(
      `/appointments/${appointmentId}/cancel`,
      payload
    );
    return response.data;
  },

  createAppointment: async (payload: AppointmentFormPayload) => {
    const response = await axiosInstance.post('/appointments', payload);
    return response.data;
  },
};
