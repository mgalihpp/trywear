import type { CreateAddressInput, UpdateAddressInput } from "@repo/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { useAddressStore } from "../store/addressStore";

export const useAddresses = () => {
  const { setAddresses } = useAddressStore();
  const { data } = authClient.useSession();

  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const data = await api.address.getAll();

      setAddresses(data);
      return data;
    },
    enabled: !!data?.user.id,
  });
};

export const useAddAddress = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<CreateAddressInput, "user_id">) =>
      api.address.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

export const useUpdateAddress = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateAddressInput;
    }) => api.address.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

export const useDeleteAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => api.address.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["addresses"],
      });
    },
  });
};
