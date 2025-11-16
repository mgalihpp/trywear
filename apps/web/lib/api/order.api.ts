import axios from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { OrderWithFullRelations, OrderWithRelations } from "@/types/index";

export const orderApi = {
  getAll: async () => {
    const res = await axios.get<ApiResponse<OrderWithRelations[]>>("/orders");
    const { data } = res.data;
    return data;
  },

  getById: async (orderId: string) => {
    const res = await axios.get<ApiResponse<OrderWithFullRelations>>(
      `/orders/${orderId}`,
    );
    const { data } = res.data;
    return data;
  },
};
