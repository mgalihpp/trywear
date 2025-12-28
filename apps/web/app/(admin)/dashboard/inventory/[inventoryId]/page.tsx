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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Textarea } from "@repo/ui/components/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Edit2,
  Package,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/features/admin/utils";
import { api } from "@/lib/api";

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

export default function InventoryDetailPage() {
  const params = useParams();
  const variantId = params.inventoryId as string;
  const queryClient = useQueryClient();

  // Dialogs state
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [thresholdDialogOpen, setThresholdDialogOpen] = useState(false);

  // Stock update form state
  const [stockQuantity, setStockQuantity] = useState(0);
  const [stockType, setStockType] = useState<"add" | "remove" | "set">("add");
  const [stockReason, setStockReason] = useState("");

  // Threshold form state
  const [thresholdValue, setThresholdValue] = useState(0);

  // Fetch inventory data
  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["inventory", variantId],
    queryFn: () => api.inventory.getById(variantId),
    enabled: !!variantId,
  });

  // Fetch stock movements
  const { data: movements, isLoading: movementsLoading } = useQuery({
    queryKey: ["inventory-movements", variantId],
    queryFn: () => api.inventory.getMovements(variantId),
    enabled: !!variantId,
  });

  // Update stock mutation
  const updateStockMutation = useMutation({
    mutationFn: (data: {
      quantity: number;
      type: "add" | "remove" | "set";
      reason?: string;
    }) => api.inventory.updateStock(variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", variantId] });
      queryClient.invalidateQueries({
        queryKey: ["inventory-movements", variantId],
      });
      queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      setStockDialogOpen(false);
      resetStockForm();
    },
  });

  // Update threshold mutation
  const updateThresholdMutation = useMutation({
    mutationFn: (safetyStock: number) =>
      api.inventory.updateThreshold(variantId, safetyStock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", variantId] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      setThresholdDialogOpen(false);
    },
  });

  const resetStockForm = () => {
    setStockQuantity(0);
    setStockType("add");
    setStockReason("");
  };

  const handleOpenStockDialog = () => {
    setStockQuantity(0);
    setStockType("add");
    setStockReason("");
    setStockDialogOpen(true);
  };

  const handleOpenThresholdDialog = () => {
    if (inventory) {
      setThresholdValue(inventory.safety_stock);
    }
    setThresholdDialogOpen(true);
  };

  const handleUpdateStock = () => {
    updateStockMutation.mutate({
      quantity: stockQuantity,
      type: stockType,
      reason: stockReason || undefined,
    });
  };

  const handleUpdateThreshold = () => {
    updateThresholdMutation.mutate(thresholdValue);
  };

  const getStockStatus = (): StockStatus => {
    if (!inventory) return "optimal";
    if (inventory.stock_quantity === 0) return "out";
    if (inventory.stock_quantity <= inventory.safety_stock) return "low";
    return "optimal";
  };

  const getActionIcon = (action: string) => {
    if (action === "STOCK_ADD")
      return <ArrowUp className="w-4 h-4 text-emerald-600" />;
    if (action === "STOCK_REMOVE")
      return <ArrowDown className="w-4 h-4 text-destructive" />;
    if (action === "STOCK_UNRESERVE")
      return <Package className="w-4 h-4 text-blue-500" />;
    return <Edit2 className="w-4 h-4 text-blue-600" />;
  };

  const getActionLabel = (action: string) => {
    if (action === "STOCK_ADD") return "Tambah Stok";
    if (action === "STOCK_REMOVE") return "Kurang Stok";
    if (action === "STOCK_UNRESERVE") return "Batal Reservasi";
    return "Set Stok";
  };

  if (inventoryLoading) {
    return (
      <div className="p-0 md:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="p-0 md:p-8 space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Inventory tidak ditemukan</p>
          <Link href="/dashboard/inventory">
            <Button variant="link">Kembali ke Inventory</Button>
          </Link>
        </div>
      </div>
    );
  }

  const product = inventory.variant.product;
  const variant = inventory.variant;
  const optionValues = variant.option_values as Record<string, string> | null;
  const status = getStockStatus();
  const unitPrice =
    Number(product.price_cents) + Number(variant.additional_price_cents);
  const totalValue = unitPrice * inventory.stock_quantity;

  return (
    <div className="p-0 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {product.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">
              {optionValues
                ? Object.entries(optionValues)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" | ")
                : (variant.sku ?? variantId.slice(0, 8))}
            </p>
            {product.supplier && (
              <>
                <span className="text-muted-foreground">•</span>
                <Badge variant="outline" className="font-normal capitalize">
                  Pemasok: {product.supplier.name}
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Levels */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Level Stok</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenStockDialog}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Update Stok
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenThresholdDialog}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Atur Batas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Stok Saat Ini</p>
                  <p className="text-2xl font-bold">
                    {inventory.stock_quantity}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Reserved</p>
                  <p className="text-2xl font-bold">
                    {inventory.reserved_quantity}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Tersedia</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {inventory.stock_quantity - inventory.reserved_quantity}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Batas Minimum</p>
                  <p className="text-2xl font-bold">{inventory.safety_stock}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Movement History */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Perubahan Stok</CardTitle>
            </CardHeader>
            <CardContent>
              {movementsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : movements && movements.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aksi</TableHead>
                        <TableHead>Perubahan</TableHead>
                        <TableHead>Stok Lama</TableHead>
                        <TableHead>Stok Baru</TableHead>
                        <TableHead>Alasan</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Waktu</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map((movement) => (
                        <TableRow key={String(movement.id)}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionIcon(movement.action)}
                              <span className="whitespace-nowrap">
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
                          <TableCell>{movement.previous_quantity}</TableCell>
                          <TableCell>{movement.new_quantity}</TableCell>
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
                          <TableCell className="whitespace-nowrap">
                            {movement.user_name || "-"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {format(
                              new Date(movement.created_at),
                              "dd MMM yyyy HH:mm",
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Belum ada riwayat perubahan stok
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">SKU</p>
                <p className="font-mono font-medium">
                  {variant.sku ?? variantId.slice(0, 8)}
                </p>
              </div>

              {status !== "optimal" && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md flex gap-2 dark:bg-yellow-950 dark:border-yellow-800">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-900 text-sm dark:text-yellow-100">
                      {status === "out" ? "Stok Habis!" : "Stok Rendah"}
                    </p>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      {status === "out"
                        ? "Segera lakukan restok"
                        : "Stok di bawah batas minimum"}
                    </p>
                  </div>
                </div>
              )}

              <Badge className={statusColors[status]}>
                {statusLabels[status]}
              </Badge>

              <div>
                <p className="text-sm text-muted-foreground">Nilai Stok</p>
                <p className="text-xl font-bold">
                  {formatCurrency(totalValue)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Harga per Unit</p>
                <p className="font-medium">{formatCurrency(unitPrice)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Product Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Produk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {product.product_images?.[0] && (
                <img
                  src={product.product_images[0].url}
                  alt={product.title}
                  className="w-full h-32 object-cover rounded-md"
                />
              )}
              <Link
                href={`/dashboard/products/${product.id}/edit`}
                className="block"
              >
                <Button className="w-full" variant="outline">
                  Lihat Produk
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={handleOpenStockDialog}
              >
                Update Stok
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={handleOpenThresholdDialog}
              >
                Atur Batas Minimum
              </Button>
              <Link href="/dashboard/inventory" className="block">
                <Button className="w-full" variant="outline">
                  Kembali ke Inventory
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stock Update Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stok</DialogTitle>
            <DialogDescription>
              {product.title}
              {variant.sku && ` (${variant.sku})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              Stok saat ini:{" "}
              <span className="font-semibold text-foreground">
                {inventory.stock_quantity}
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
              {product.title}
              {variant.sku && ` (${variant.sku})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              Batas minimum saat ini:{" "}
              <span className="font-semibold text-foreground">
                {inventory.safety_stock}
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
    </div>
  );
}
