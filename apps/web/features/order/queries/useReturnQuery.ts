import type { CreateReturnInput, UpdateReturnStatusInput } from "@repo/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

/**
 * Get all returns (for admin)
 */
export const useReturns = () => {
  return useQuery({
    queryKey: ["returns"],
    queryFn: api.return.getAll,
  });
};

/**
 * Get returns for current user
 */
export const useUserReturns = () => {
  return useQuery({
    queryKey: ["user-returns"],
    queryFn: api.return.getByUser,
  });
};

/**
 * Get return by ID
 */
export const useReturn = (returnId: string) => {
  return useQuery({
    queryKey: ["return", returnId],
    queryFn: () => api.return.getById(returnId),
    enabled: !!returnId,
  });
};

/**
 * Create a new return request
 */
export const useCreateReturn = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReturnInput) => api.return.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-returns"] });
      qc.invalidateQueries({ queryKey: ["user-order"] });
    },
  });
};

/**
 * Update return status (admin)
 */
export const useUpdateReturnStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      returnId,
      input,
    }: {
      returnId: string;
      input: UpdateReturnStatusInput;
    }) => api.return.updateStatus(returnId, input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["returns"] });
      qc.invalidateQueries({ queryKey: ["return", variables.returnId] });
    },
  });
};
