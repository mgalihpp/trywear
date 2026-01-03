import type { Addresses } from "@repo/db";
import type { CreateAddressInput, UpdateAddressInput } from "@repo/schema";
import axios from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export const addressApi = {
  create: async (input: Omit<CreateAddressInput, "user_id">) => {
    const res = await axios.post<ApiResponse<Addresses>>("/address", input);
    const { data } = res.data;
    return data;
  },

  getAll: async () => {
    const res = await axios.get<ApiResponse<Addresses[]>>("/address");
    const { data } = res.data;
    return data;
  },

  update: async (id: number, input: UpdateAddressInput) => {
    const res = await axios.put<ApiResponse<Addresses>>(
      `/address/${id}`,
      input,
    );
    const { data } = res.data;
    return data;
  },

  delete: async (id: number) => {
    const res = await axios.delete<ApiResponse<Addresses>>(`/address/${id}`);
    const { data } = res.data;
    return data;
  },
};
