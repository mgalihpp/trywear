import type {
  CreateCouponInput,
  UpdateCouponInput,
} from "@repo/schema/couponSchema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const useCoupons = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: () => api.coupon.getAll(),
  });
};

export const useCoupon = (id: string) => {
  return useQuery({
    queryKey: ["coupons", id],
    queryFn: () => api.coupon.getById(id),
    enabled: !!id,
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCouponInput) => api.coupon.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Kupon berhasil dibuat");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal membuat kupon");
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCouponInput }) =>
      api.coupon.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Kupon berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui kupon");
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.coupon.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Kupon berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menghapus kupon");
    },
  });
};
