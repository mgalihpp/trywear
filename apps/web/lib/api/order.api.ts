import type { Orders, Shipments } from "@repo/db";
import type { CreateOrderInput, UpdateOrderStatusInput } from "@repo/schema";
import axios from "@/lib/axios";
import type { ApiResponse, SnapPayload } from "@/types/api";
import type { OrderWithFullRelations, OrderWithRelations } from "@/types/index";

export const orderApi = {
  getAll: async (status?: string) => {
    const res = await axios.get<ApiResponse<OrderWithRelations[]>>(
      `/orders${status ? `?status=${status}` : ""}`,
    );
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

  getByUser: async () => {
    const res =
      await axios.get<ApiResponse<OrderWithFullRelations[]>>(`/orders/me`);
    const { data } = res.data;
    return data;
  },

  create: async (input: CreateOrderInput, idKey: string) => {
    const res = await axios.post<ApiResponse<SnapPayload>>(`/orders`, input, {
      headers: {
        "x-idempotency-key": idKey,
      },
    });
    const { data } = res.data;
    return data;
  },

  updateStatus: async (orderId: string, input: UpdateOrderStatusInput) => {
    const res = await axios.put<
      ApiResponse<{ order: Orders; shipment: Shipments }>
    >(`/orders/${orderId}/status`, input);
    const { data } = res.data;
    return data;
  },
};
