import type { UpdateOrderStatusInput } from "@repo/schema/orderSchema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.order.getById(orderId),
    enabled: !!orderId,
  });
};

export const usePaymentStatus = (orderId: string) => {
  return useQuery({
    queryKey: ["payment", orderId],
    queryFn: () => api.payment.getStatus(orderId),
    enabled: !!orderId,
  });
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
