import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@repo/schema/categorySchema";
import axios from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { CategoryWithRelations } from "@/types/index";

export const categoryApi = {
  getAll: async () => {
    const res =
      await axios.get<ApiResponse<CategoryWithRelations[]>>("/categories");
    const { data } = res.data;
    return data;
  },

  getById: async (id: number) => {
    const res = await axios.get<ApiResponse<CategoryWithRelations>>(
      `/categories/${id}`,
    );
    const { data } = res.data;
    return data;
  },

  create: async (input: CreateCategoryInput) => {
    const res = await axios.post<ApiResponse<CategoryWithRelations>>(
      "/categories",
      input,
    );
    const { data } = res.data;
    return data;
  },

  update: async (id: number, input: UpdateCategoryInput) => {
    const res = await axios.put<ApiResponse<CategoryWithRelations>>(
      `/categories/${id}`,
      input,
    );
    const { data } = res.data;
    return data;
  },

  delete: async (id: number) => {
    const res = await axios.delete<ApiResponse<null>>(`/categories/${id}`);
    return res.data;
  },
};
