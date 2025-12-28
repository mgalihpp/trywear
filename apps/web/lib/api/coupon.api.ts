import type {
  CreateCouponInput,
  UpdateCouponInput,
} from "@repo/schema/couponSchema";
import axios from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { Coupon } from "@/types/index";

export const couponApi = {
  getAll: async () => {
    const res = await axios.get<ApiResponse<Coupon[]>>("/coupons");
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await axios.get<ApiResponse<Coupon>>(`/coupons/${id}`);
    return res.data.data;
  },

  create: async (data: CreateCouponInput) => {
    const res = await axios.post<ApiResponse<Coupon>>("/coupons", data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateCouponInput) => {
    const res = await axios.put<ApiResponse<Coupon>>(`/coupons/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await axios.delete<ApiResponse<{ message: string }>>(
      `/coupons/${id}`,
    );
    return res.data;
  },

  getAvailable: async () => {
    const res = await axios.get<ApiResponse<Coupon[]>>("/coupons/available");
    return res.data.data;
  },

  validate: async (code: string, subtotal: number) => {
    const res = await axios.post<
      ApiResponse<{
        coupon: Coupon;
        discountAmount: number;
      }>
    >("/coupons/validate", { code, subtotal });
    return res.data.data;
  },

  getUsage: async (id: string) => {
    const res = await axios.get<
      ApiResponse<
        {
          id: string;
          created_at: string;
          total_cents: number;
          user?: {
            id: string;
            name: string | null;
            email: string;
            image: string | null;
          };
        }[]
      >
    >(`/coupons/${id}/usage`);
    return res.data.data;
  },
};
