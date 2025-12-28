import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useSegments = () => {
  return useQuery({
    queryKey: ["segments"],
    queryFn: () => api.segment.getAll(),
  });
};
