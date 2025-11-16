import type { Product } from "@repo/db";
import type {
  CreateProductImagesInput,
  CreateProductInput,
  CreateVariantInput,
  UpdateProductInput,
  UpdateVariantInput,
} from "@repo/schema/productSchema";
import axios from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { ProductWithRelations } from "@/types/index";

export const productApi = {
  getAll: async () => {
    const res =
      await axios.get<ApiResponse<ProductWithRelations[]>>("/products");
    const { data } = res.data;
    return data;
  },

  getById: async (productId: string) => {
    const res = await axios.get<ApiResponse<ProductWithRelations>>(
      `/products/${productId}`,
    );
    const { data } = res.data;
    return data;
  },

  getRelatedProducts: async (productId: string) => {
    const res = await axios.get<ApiResponse<ProductWithRelations[]>>(
      `/products/related/${productId}`,
    );
    const { data } = res.data;
    return data;
  },

  create: async (input: CreateProductInput) => {
    const res = await axios.post<ApiResponse<Product>>("/products", input);
    const { data } = res.data;
    return data;
  },

  createVariant: async (input: CreateVariantInput[]) => {
    const res = await axios.post("/products/variant", input);
    const { data } = res.data;
    return data;
  },

  createImages: async (input: CreateProductImagesInput) => {
    const res = await axios.post("/products/images", input);
    const { data } = res.data;
    return data;
  },

  update: async (productId: string, input: UpdateProductInput) => {
    const res = await axios.put<ApiResponse<Product>>(
      `/products/${productId}`,
      input,
    );
    const { data } = res.data;
    return data;
  },

  updateVariant: async (variantId: string, input: UpdateVariantInput) => {
    const res = await axios.put(`/products/variant/${variantId}`, input);
    const { data } = res.data;
    return data;
  },

  delete: async (productId: string) => {
    const res = await axios.delete(`/products/${productId}`);
    const { data } = res.data;
    return data;
  },

  deleteVariant: async (variantId: string) => {
    const res = await axios.delete(`/products/variant/${variantId}`);
    const { data } = res.data;
    return data;
  },

  deleteImage: async (imageId: number) => {
    const res = await axios.delete(`/products/images/${imageId}`);
    const { data } = res.data;
    return data;
  },

  filter: {
    getAll: async (filters?: {
      categoryId?: number;
      colors?: string[];
      sizes?: string[];
      priceRange?: [number, number];
      query?: string;
      sort?: string;
      page?: number;
      limit?: number;
    }) => {
      const res = await axios.get<ApiResponse<ProductWithRelations[]>>(
        "/products/filters",
        {
          params: filters,
        },
      );
      const { data } = res.data;
      return data;
    },

    getFilters: async () => {
      const res = await axios.get<
        ApiResponse<{
          colors: string[];
          sizes: string[];
        }>
      >("/products/get-filters");
      const { data } = res.data;
      return data;
    },
  },
};
