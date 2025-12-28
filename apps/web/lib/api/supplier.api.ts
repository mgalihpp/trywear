import type { SupplierInput } from "@repo/schema";
import axios from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { Supplier, SupplierWithDetails } from "@/types/index";

export const supplierApi = {
  /**
   * Get all suppliers
   */
  getAll: async () => {
    const res = await axios.get<ApiResponse<Supplier[]>>("/suppliers");
    return res.data.data;
  },

  /**
   * Get supplier by ID
   */
  getById: async (id: number) => {
    const res = await axios.get<ApiResponse<SupplierWithDetails>>(
      `/suppliers/${id}`,
    );
    return res.data.data;
  },

  /**
   * Create new supplier
   */
  create: async (data: SupplierInput) => {
    const res = await axios.post<ApiResponse<Supplier>>("/suppliers", data);
    return res.data.data;
  },

  /**
   * Update supplier
   */
  update: async (id: number, data: Partial<SupplierInput>) => {
    const res = await axios.patch<ApiResponse<Supplier>>(
      `/suppliers/${id}`,
      data,
    );
    return res.data.data;
  },

  /**
   * Delete supplier
   */
  delete: async (id: number) => {
    const res = await axios.delete<ApiResponse<void>>(`/suppliers/${id}`);
    return res.data.data;
  },
};
