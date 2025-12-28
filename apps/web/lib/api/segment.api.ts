import axios from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { CustomerSegment, SegmentStats } from "@/types/index";

export interface CreateSegmentInput {
  name: string;
  slug: string;
  description?: string;
  min_spend_cents: number;
  max_spend_cents?: number | null;
  discount_percent?: number;
  color?: string;
  icon?: string;
  priority?: number;
  is_active?: boolean;
}

export interface UpdateSegmentInput extends Partial<CreateSegmentInput> {}

export const segmentApi = {
  getAll: async (includeInactive = false) => {
    const res = await axios.get<ApiResponse<CustomerSegment[]>>(
      `/segments?include_inactive=${includeInactive}`,
    );
    const { data } = res.data;
    return data;
  },

  getById: async (id: number) => {
    const res = await axios.get<ApiResponse<CustomerSegment>>(
      `/segments/${id}`,
    );
    const { data } = res.data;
    return data;
  },

  create: async (input: CreateSegmentInput) => {
    const res = await axios.post<ApiResponse<CustomerSegment>>(
      "/segments",
      input,
    );
    const { data } = res.data;
    return data;
  },

  update: async (id: number, input: UpdateSegmentInput) => {
    const res = await axios.put<ApiResponse<CustomerSegment>>(
      `/segments/${id}`,
      input,
    );
    const { data } = res.data;
    return data;
  },

  delete: async (id: number) => {
    const res = await axios.delete<ApiResponse<void>>(`/segments/${id}`);
    return res.data;
  },

  getStats: async () => {
    const res = await axios.get<ApiResponse<SegmentStats[]>>("/segments/stats");
    const { data } = res.data;
    return data;
  },

  recalculate: async () => {
    const res = await axios.post<ApiResponse<{ updated: number }>>(
      "/segments/recalculate",
    );
    const { data } = res.data;
    return data;
  },

  assignToUser: async (userId: string) => {
    const res = await axios.post<
      ApiResponse<{ spending: bigint; segment: CustomerSegment | null }>
    >(`/segments/assign/${userId}`);
    const { data } = res.data;
    return data;
  },
};
