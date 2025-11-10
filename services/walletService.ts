import axiosInstance from './axiosInstance';

export interface WalletInfo {
  balance: number;
  frozenAmount: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalSpent: number;
  totalRefunded: number;
  escrowAmount: number;
  currency: string;
  status: string;
  lastTransactionAt?: string;
}

export interface VNPayDepositPayload {
  amount: number;
  description: string;
}

export interface VNPayPaymentResponse {
  success: boolean;
  paymentUrl?: string;
  message?: string;
}

export const walletService = {
  fetchWallet: async () => {
    const response = await axiosInstance.get<{
      success: boolean;
      data: WalletInfo;
    }>('/wallet');
    return response.data;
  },

  depositWithVNPay: async (payload: VNPayDepositPayload) => {
    const response = await axiosInstance.post<VNPayPaymentResponse>(
      '/wallet/deposit/vnpay',
      payload
    );
    return response.data;
  },
};
