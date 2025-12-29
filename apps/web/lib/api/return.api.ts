import type { Orders, ReturnItems, Returns } from "@repo/db";
import type {
  CreateReturnInput,
  ReturnStatusType,
  UpdateReturnStatusInput,
} from "@repo/schema/returnSchema";
import axios from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

// Types for return data with relations
export interface ReturnWithRelations extends Returns {
  order?: Orders & {
    order_items: Array<{
      id: number;
      title: string | null;
      quantity: number;
      variant?: {
        product: {
          product_images: Array<{ url: string }>;
        };
      } | null;
    }>;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  return_items: Array<
    ReturnItems & {
      order_item?: {
        id: number;
        title: string | null;
        quantity: number;
      } | null;
    }
  >;
}

export const returnApi = {
  /**
   * Get all returns (admin)
   */
  getAll: async () => {
    const res = await axios.get<ApiResponse<ReturnWithRelations[]>>("/returns");
    return res.data.data;
  },

  /**
   * Get returns for current user
   */
  getByUser: async () => {
    const res =
      await axios.get<ApiResponse<ReturnWithRelations[]>>("/returns/me");
    return res.data.data;
  },

  /**
   * Get return by ID
   */
  getById: async (returnId: string) => {
    const res = await axios.get<ApiResponse<ReturnWithRelations>>(
      `/returns/${returnId}`,
    );
    return res.data.data;
  },

  /**
   * Create a new return request (customer)
   */
  create: async (input: CreateReturnInput) => {
    const res = await axios.post<ApiResponse<ReturnWithRelations>>(
      "/returns",
      input,
    );
    return res.data.data;
  },

  /**
   * Update return status (admin)
   */
  updateStatus: async (returnId: string, input: UpdateReturnStatusInput) => {
    const res = await axios.put<ApiResponse<ReturnWithRelations>>(
      `/returns/${returnId}/status`,
      input,
    );
    return res.data.data;
  },
};
