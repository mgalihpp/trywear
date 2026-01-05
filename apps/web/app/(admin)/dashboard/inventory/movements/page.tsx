"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, Edit2, Package } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/features/admin/components/data-table";
import { DataTableSkeleton } from "@/features/admin/components/data-table-skeleton";
import { ErrorAlert } from "@/features/admin/components/error-alert";
import { formatDate } from "@/features/admin/utils";
import { api } from "@/lib/api";

interface StockMovement {
  id: string | number;
  variant_id: string;
  product_title: string;
  variant_name: string;
  sku: string | null;
  action: string;
  quantity_change: number;
  new_quantity: number;
  reason: string | null;
  user_name: string | null;
  created_at: string;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case "STOCK_ADD":
      return <ArrowUp className="w-4 h-4 text-emerald-600" />;
    case "STOCK_REMOVE":
      return <ArrowDown className="w-4 h-4 text-destructive" />;
    case "STOCK_UNRESERVE":
      return <Package className="w-4 h-4 text-blue-500" />;
    default:
      return <Edit2 className="w-4 h-4 text-muted-foreground" />;
  }
};

const getActionLabel = (action: string) => {
  switch (action) {
    case "STOCK_ADD":
      return "Tambah Stok";
    case "STOCK_REMOVE":
      return "Kurangi Stok";
    case "STOCK_SET":
      return "Set Stok";
    case "STOCK_UNRESERVE":
      return "Pembatalan Pesanan";
    default:
      return action;
  }
};

export default function GlobalStockMovementsPage() {
  const {
    data: movements,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["inventory-movements-global"],
    queryFn: () => api.inventory.getAllMovements(),
  });

  const columns: ColumnDef<StockMovement>[] = [
    {
      accessorKey: "product_title",
      header: "Produk",
      cell: ({ row }) => (
        <div className="space-y-1 min-w-[200px]">
          <Link
            href={`/dashboard/inventory/${row.original.variant_id}`}
            className="font-medium hover:underline text-primary block"
          >
            {row.original.product_title}
          </Link>
          <p className="text-xs text-muted-foreground">
            {row.original.variant_name}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <span className="font-mono text-xs whitespace-nowrap">
          {row.original.sku || "-"}
        </span>
      ),
    },
    {
      accessorKey: "action",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          {getActionIcon(row.original.action)}
          <span className="text-sm">{getActionLabel(row.original.action)}</span>
        </div>
      ),
    },
    {
      accessorKey: "quantity_change",
      header: "Perubahan",
      cell: ({ row }) => (
        <span
          className={
            row.original.quantity_change >= 0
              ? "text-emerald-600 font-medium"
              : "text-destructive font-medium"
          }
        >
          {row.original.quantity_change >= 0 ? "+" : ""}
          {row.original.quantity_change}
        </span>
      ),
    },
    {
      accessorKey: "new_quantity",
      header: "Stok Baru",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.new_quantity}</span>
      ),
    },
    {
      accessorKey: "reason",
      header: "Alasan",
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate block cursor-help max-w-[150px]">
                {row.original.reason || "-"}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs break-words">{row.original.reason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      accessorKey: "user_name",
      header: "User",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {row.original.user_name || "System"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Waktu",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Pergerakan Stok
          </h1>
          <p className="text-muted-foreground mt-2">
            Riwayat lengkap perubahan stok produk secara global
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Aktivitas Stok</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <DataTableSkeleton columns={8} rows={8} />
          ) : isError ? (
            <ErrorAlert
              description="Gagal memuat data pergerakan stok."
              action={() => refetch()}
            />
          ) : movements && movements.length > 0 ? (
            <DataTable
              columns={columns}
              data={(movements as StockMovement[]) ?? []}
              searchPlaceholder="Cari berdasarkan produk..."
              searchKey="product_title"
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              Belum ada pergerakan stok yang tercatat.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
