import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const useDeleteProduct = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => api.product.delete(productId),
    onSuccess: () => {
      toast.success("Produk berhasil dihapus!");
      queryClient.refetchQueries({
        queryKey: ["products"],
      });
      router.push(`/dashboard/products`);
    },
    onError: () => {
      toast.error("Gagal menghapus produk");
    },
  });
};

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: api.product.getAll,
  });
};
