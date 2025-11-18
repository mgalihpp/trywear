import axios from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { PaymentGatewaySuccessResponse } from "@/types/midtrans";

export const paymentApi = {
  getStatus: async (orderId: string) => {
    const res = await axios.get<ApiResponse<PaymentGatewaySuccessResponse>>(
      `/payment/status/${orderId}`,
    );
    const { data } = res.data;
    return data;
  },
};
