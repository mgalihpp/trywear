"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type SupplierSelectProps = {
  value?: number;
  onValueChange: (value: number) => void;
  placeholder?: string;
};

export function SupplierSelect({
  value,
  onValueChange,
  placeholder = "Pilih pemasok...",
}: SupplierSelectProps) {
  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => api.supplier.getAll(),
  });

  return (
    <Select
      value={value?.toString()}
      onValueChange={(val) => onValueChange(Number(val))}
      disabled={isLoading}
    >
      <SelectTrigger className="w-full bg-card">
        <SelectValue
          placeholder={isLoading ? "Memuat pemasok..." : placeholder}
        />
      </SelectTrigger>
      <SelectContent>
        {suppliers?.map((supplier) => (
          <SelectItem key={supplier.id} value={supplier.id.toString()}>
            {supplier.name}
          </SelectItem>
        ))}
        {suppliers?.length === 0 && (
          <div className="p-2 text-sm text-muted-foreground text-center">
            Belum ada pemasok terdaftar
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
