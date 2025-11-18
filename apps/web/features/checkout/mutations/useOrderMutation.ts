import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: api.order.create,
    onError: (err) => {
      console.error("Gagal melakukan pembayaran", err);
    },
    onSuccess: (data) => {
      console.log("Berhasil melakukan pembayaran ", data);
    },
  });
};
