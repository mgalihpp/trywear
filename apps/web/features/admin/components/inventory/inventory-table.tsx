"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Textarea } from "@repo/ui/components/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  Edit2,
  Eye,
  MoreHorizontal,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatCurrency } from "@/features/admin/utils";
import { api } from "@/lib/api";
import type { InventoryWithRelations } from "@/types/index";
import { DataTable } from "../data-table";

type StockStatus = "optimal" | "low" | "out";

const statusColors: Record<StockStatus, string> = {
  optimal: "bg-emerald-100 text-emerald-800",
  low: "bg-orange-100 text-orange-800",
  out: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<StockStatus, string> = {
  optimal: "Optimal",
  low: "Rendah",
  out: "Habis",
};

function getStockStatus(item: InventoryWithRelations): StockStatus {
  if (item.stock_quantity === 0) return "out";
  if (item.stock_quantity <= item.safety_stock) return "low";
  return "optimal";
}

export function InventoryTable() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"all" | "low" | "out">(
    "all",
  );
  const [selectedItem, setSelectedItem] =
    useState<InventoryWithRelations | null>(null);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [thresholdDialogOpen, setThresholdDialogOpen] = useState(false);

  // Stock update form state
  const [stockQuantity, setStockQuantity] = useState(0);
  const [stockType, setStockType] = useState<"add" | "remove" | "set">("add");
  const [stockReason, setStockReason] = useState("");

  // Threshold form state
  const [thresholdValue, setThresholdValue] = useState(0);

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["inventory", statusFilter],
    queryFn: () => api.inventory.getAll(statusFilter),
  });

  const updateStockMutation = useMutation({
    mutationFn: ({
      variantId,
      data,
    }: {
      variantId: string;
      data: {
        quantity: number;
        type: "add" | "remove" | "set";
        reason?: string;
      };
    }) => api.inventory.updateStock(variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      setStockDialogOpen(false);
      resetStockForm();
    },
  });

  const updateThresholdMutation = useMutation({
    mutationFn: ({
      variantId,
      safetyStock,
    }: {
      variantId: string;
      safetyStock: number;
    }) => api.inventory.updateThreshold(variantId, safetyStock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      setThresholdDialogOpen(false);
    },
  });

  const resetStockForm = () => {
    setStockQuantity(0);
    setStockType("add");
    setStockReason("");
  };

  const handleOpenStockDialog = (item: InventoryWithRelations) => {
    setSelectedItem(item);
    setStockQuantity(0);
    setStockType("add");
    setStockReason("");
    setStockDialogOpen(true);
  };

  const handleOpenThresholdDialog = (item: InventoryWithRelations) => {
    setSelectedItem(item);
    setThresholdValue(item.safety_stock);
    setThresholdDialogOpen(true);
  };

  const handleUpdateStock = () => {
    if (!selectedItem) return;
    updateStockMutation.mutate({
      variantId: selectedItem.variant_id,
      data: {
        quantity: stockQuantity,
        type: stockType,
        reason: stockReason || undefined,
      },
    });
  };

  const handleUpdateThreshold = () => {
    if (!selectedItem) return;
    updateThresholdMutation.mutate({
      variantId: selectedItem.variant_id,
      safetyStock: thresholdValue,
    });
  };

  const columns: ColumnDef<InventoryWithRelations>[] = [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.variant.sku ?? row.original.variant_id.slice(0, 8)}
        </span>
      ),
    },
    {
      accessorKey: "product",
      header: "Produk",
      cell: ({ row }) => {
        const product = row.original.variant.product;
        const variant = row.original.variant;
        const optionValues = variant.option_values as Record<
          string,
          string
        > | null;

        return (
          <div className="flex items-center gap-3">
            {product.product_images?.[0] && (
              <img
                src={product.product_images[0].url}
                alt={product.title}
                className="w-10 h-10 rounded-md object-cover"
              />
            )}
            <div>
              <p className="font-medium whitespace-nowrap">{product.title}</p>
              {optionValues && (
                <p className="text-xs text-muted-foreground">
                  {Object.entries(optionValues)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "supplier",
      header: "Pemasok",
      cell: ({ row }) => {
        const supplier = row.original.variant.product.supplier;
        if (!supplier) return "-";
        return (
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {supplier.name}
          </span>
        );
      },
    },
    {
      accessorKey: "stock_quantity",
      header: "Stok",
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.stock_quantity}</span>
      ),
    },
    {
      accessorKey: "reserved_quantity",
      header: "Reserved",
      cell: ({ row }) => row.original.reserved_quantity,
    },
    {
      accessorKey: "safety_stock",
      header: "Batas Minimum",
      cell: ({ row }) => row.original.safety_stock,
    },
    {
      accessorKey: "value",
      header: "Nilai Stok",
      cell: ({ row }) => {
        const product = row.original.variant.product;
        const variant = row.original.variant;
        const unitPrice =
          Number(product.price_cents) + Number(variant.additional_price_cents);
        const totalValue = unitPrice * row.original.stock_quantity;
        return formatCurrency(totalValue);
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = getStockStatus(row.original);
        return (
          <div className="flex items-center gap-2">
            {status !== "optimal" && (
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            )}
            <Badge className={statusColors[status]}>
              {statusLabels[status]}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/inventory/${item.variant_id}`}
                  className="flex items-center"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleOpenStockDialog(item)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Update Stok
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenThresholdDialog(item)}>
                <Settings className="mr-2 h-4 w-4" />
                Atur Batas Minimum
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stok Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Stok Produk</CardTitle>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as "all" | "low" | "out")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="low">Stok Rendah</SelectItem>
              <SelectItem value="out">Stok Habis</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={inventory ?? []}
            searchPlaceholder="Cari SKU atau produk..."
            searchKey="sku"
          />
        </CardContent>
      </Card>

      {/* Stock Update Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stok</DialogTitle>
            <DialogDescription>
              {selectedItem?.variant.product.title}
              {selectedItem?.variant.sku && ` (${selectedItem.variant.sku})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              Stok saat ini:{" "}
              <span className="font-semibold text-foreground">
                {selectedItem?.stock_quantity}
              </span>
            </div>
            <div className="space-y-2">
              <Label>Tipe Perubahan</Label>
              <Select
                value={stockType}
                onValueChange={(v) =>
                  setStockType(v as "add" | "remove" | "set")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Tambah Stok</SelectItem>
                  <SelectItem value="remove">Kurangi Stok</SelectItem>
                  <SelectItem value="set">Set Jumlah</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Jumlah</Label>
              <Input
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Alasan (opsional)</Label>
              <Textarea
                value={stockReason}
                onChange={(e) => setStockReason(e.target.value)}
                placeholder="Contoh: Restok dari supplier, Koreksi inventaris..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleUpdateStock}
              disabled={updateStockMutation.isPending}
            >
              {updateStockMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Threshold Dialog */}
      <Dialog open={thresholdDialogOpen} onOpenChange={setThresholdDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atur Batas Minimum Stok</DialogTitle>
            <DialogDescription>
              {selectedItem?.variant.product.title}
              {selectedItem?.variant.sku && ` (${selectedItem.variant.sku})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              Batas minimum saat ini:{" "}
              <span className="font-semibold text-foreground">
                {selectedItem?.safety_stock}
              </span>
            </div>
            <div className="space-y-2">
              <Label>Batas Minimum Baru</Label>
              <Input
                type="number"
                min={0}
                value={thresholdValue}
                onChange={(e) => setThresholdValue(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Anda akan mendapat peringatan saat stok mencapai atau di bawah
                nilai ini.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setThresholdDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdateThreshold}
              disabled={updateThresholdMutation.isPending}
            >
              {updateThresholdMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
