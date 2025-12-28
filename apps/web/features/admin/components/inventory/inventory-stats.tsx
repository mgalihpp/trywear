"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, DollarSign, Package, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/features/admin/utils";
import { api } from "@/lib/api";

export function InventoryStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["inventory-stats"],
    queryFn: () => api.inventory.getStats(),
  });

  const statsConfig = [
    {
      title: "Total SKU",
      value: stats?.totalSku ?? 0,
      icon: Package,
      color: "text-blue-600",
      format: (v: number) => v.toString(),
    },
    {
      title: "Stok Rendah",
      value: stats?.lowStockCount ?? 0,
      icon: AlertTriangle,
      color: "text-orange-600",
      format: (v: number) => v.toString(),
    },
    {
      title: "Stok Habis",
      value: stats?.outOfStockCount ?? 0,
      icon: TrendingDown,
      color: "text-destructive",
      format: (v: number) => v.toString(),
    },
    {
      title: "Total Nilai Inventaris",
      value: stats?.totalValue ?? 0,
      icon: DollarSign,
      color: "text-emerald-600",
      format: (v: number) => formatCurrency(v),
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.format(stat.value)}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
