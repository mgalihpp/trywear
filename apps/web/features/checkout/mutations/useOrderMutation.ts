import type { CreateOrderInput } from "@repo/schema";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: ({
      input,
      idKey,
    }: {
      input: CreateOrderInput;
      idKey: string;
    }) => api.order.create(input, idKey),
    onError: (err) => {
      console.error("Gagal membuat pesanan", err);
    },
    onSuccess: (data) => {
      console.log("Berhasil membuat pesanan", data);
    },
  });
};
