import axios from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type {
  InventoryStats,
  InventoryWithRelations,
  StockMovement,
} from "@/types/index";

export const inventoryApi = {
  /**
   * Get all inventory items
   */
  getAll: async (status?: "all" | "low" | "out") => {
    const params = status ? `?status=${status}` : "";
    const res = await axios.get<ApiResponse<InventoryWithRelations[]>>(
      `/inventory${params}`,
    );
    return res.data.data;
  },

  /**
   * Get inventory statistics
   */
  getStats: async () => {
    const res =
      await axios.get<ApiResponse<InventoryStats>>("/inventory/stats");
    return res.data.data;
  },

  /**
   * Get inventory by variant ID
   */
  getById: async (variantId: string) => {
    const res = await axios.get<ApiResponse<InventoryWithRelations>>(
      `/inventory/${variantId}`,
    );
    return res.data.data;
  },

  /**
   * Update stock quantity
   */
  updateStock: async (
    variantId: string,
    data: {
      quantity: number;
      type: "add" | "remove" | "set";
      reason?: string;
    },
  ) => {
    const res = await axios.patch<ApiResponse<InventoryWithRelations>>(
      `/inventory/${variantId}/stock`,
      data,
    );
    return res.data.data;
  },

  /**
   * Update safety stock threshold
   */
  updateThreshold: async (variantId: string, safetyStock: number) => {
    const res = await axios.patch<ApiResponse<InventoryWithRelations>>(
      `/inventory/${variantId}/threshold`,
      { safetyStock },
    );
    return res.data.data;
  },

  /**
   * Get stock movement history
   */
  getMovements: async (variantId: string) => {
    const res = await axios.get<ApiResponse<StockMovement[]>>(
      `/inventory/${variantId}/movements`,
    );
    return res.data.data;
  },

  /**
   * Get global stock movement history
   */
  getAllMovements: async (limit = 100) => {
    const res = await axios.get<ApiResponse<any[]>>(
      `/inventory/movements?limit=${limit}`,
    );
    return res.data.data;
  },
};
