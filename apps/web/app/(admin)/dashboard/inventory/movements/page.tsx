"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Edit2, Package } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/features/admin/utils";
import { api } from "@/lib/api";

export default function GlobalStockMovementsPage() {
  const { data: movements, isLoading } = useQuery({
    queryKey: ["inventory-movements-global"],
    queryFn: () => api.inventory.getAllMovements(),
  });

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

  return (
    <div className="p-0 md:p-8 space-y-6">
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
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : movements && movements.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Aksi</TableHead>
                    <TableHead>Perubahan</TableHead>
                    <TableHead>Stok Baru</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={String(movement.id)}>
                      <TableCell className="min-w-[300px]">
                        <div className="space-y-1">
                          <Link
                            href={`/dashboard/inventory/${movement.variant_id}`}
                            className="font-medium hover:underline text-primary block"
                          >
                            {movement.product_title}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {movement.variant_name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="font-mono text-xs">
                          {movement.sku || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getActionIcon(movement.action)}
                          <span className="text-sm">
                            {getActionLabel(movement.action)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            movement.quantity_change >= 0
                              ? "text-emerald-600 font-medium"
                              : "text-destructive font-medium"
                          }
                        >
                          {movement.quantity_change >= 0 ? "+" : ""}
                          {movement.quantity_change}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {movement.new_quantity}
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate block cursor-help">
                                {movement.reason || "-"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs break-words">
                                {movement.reason}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {movement.user_name || "System"}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDate(movement.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
