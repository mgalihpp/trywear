import type { UpdateOrderStatusInput } from "@repo/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.order.getById(orderId),
    enabled: !!orderId,
  });
};

export const useOrderWithPayment = (orderId: string) => {
  const paymentQuery = useQuery({
    queryKey: ["payment", orderId],
    queryFn: () => api.payment.getStatus(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 10, // 10 detik, karena status pembayaran bisa berubah
    retry: 2,
  });

  const orderQuery = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.order.getById(orderId),
    enabled: !!orderId && !!paymentQuery.isFetched, // kunci di sini
    staleTime: 1000 * 30,
  });

  return {
    // Payment status (prioritas utama)
    paymentData: paymentQuery.data,
    isPaymentLoading: paymentQuery.isPending,
    isPaymentError: paymentQuery.isError,
    paymentError: paymentQuery.error,

    // Order detail
    orderData: orderQuery.data,
    isOrderLoading: orderQuery.isPending,
    isOrderError: orderQuery.isError,
    orderError: orderQuery.error,

    // Kombinasi loading state
    isLoading: paymentQuery.isPending || orderQuery.isPending,
    isError: paymentQuery.isError || orderQuery.isError,
    isSuccess: paymentQuery.isSuccess && orderQuery.isSuccess,

    // Refetch keduanya jika perlu
    refetch: () => {
      paymentQuery.refetch();
      orderQuery.refetch();
    },
  };
};

export const useUserOrders = (userId?: string) => {
  return useQuery({
    queryKey: ["user-order", userId],
    queryFn: api.order.getByUser,
    enabled: !!userId,
  });
};

export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationFn: ({
      orderId,
      input,
    }: {
      orderId: string;
      input: UpdateOrderStatusInput;
    }) => api.order.updateStatus(orderId, input),
  });
};
