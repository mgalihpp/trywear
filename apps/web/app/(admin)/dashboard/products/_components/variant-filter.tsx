"use client";

import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Filter, X } from "lucide-react";
import { useState } from "react";
import type { VariantOption } from "@/types/index";

interface FilterProps {
  variantOptions: VariantOption[];
  onFilterChange: (filters: Record<string, string[]>) => void;
}

export function VariantFilter({ variantOptions, onFilterChange }: FilterProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {},
  );

  const toggleFilter = (key: string, value: string) => {
    const newFilters = { ...activeFilters };
    const currentValues = newFilters[key] || [];

    if (currentValues.includes(value)) {
      // kalau value sudah aktif → hapus
      newFilters[key] = currentValues.filter((v) => v !== value);
      if (newFilters[key].length === 0) delete newFilters[key];
    } else {
      // kalau belum aktif → tambahkan
      newFilters[key] = [...currentValues, value];
    }

    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAll = () => {
    setActiveFilters({});
    onFilterChange({});
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          {Object.keys(activeFilters).length > 0
            ? `Filter (${Object.values(activeFilters).reduce((a, b) => a + b.length, 0)})`
            : "Filter"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Pilih Filter</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {variantOptions.length === 0 ? (
          <DropdownMenuItem disabled>Tidak ada opsi</DropdownMenuItem>
        ) : (
          variantOptions.map((opt) => (
            <div key={opt.name}>
              <DropdownMenuLabel className="text-xs capitalize text-muted-foreground">
                {opt.name}
              </DropdownMenuLabel>
              {opt.values.map((val) => {
                const isActive = activeFilters[opt.name]?.includes(val);
                return (
                  <DropdownMenuItem
                    key={val}
                    onClick={() => toggleFilter(opt.name, val)}
                    onSelect={(e) => {
                      e.preventDefault();
                    }}
                    className={
                      isActive ? "bg-accent font-medium cursor-pointer" : ""
                    }
                  >
                    {val}
                    {isActive && <X className="w-3 h-3 ml-auto" />}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
            </div>
          ))
        )}

        {Object.keys(activeFilters).length > 0 && (
          <DropdownMenuItem onClick={clearAll} className="text-destructive">
            Hapus semua
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
