"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { ErrorAlert } from "@/features/admin/components//error-alert";
import { DataTable } from "@/features/admin/components/data-table";
import { DataTableSkeleton } from "@/features/admin/components/data-table-skeleton";
import { useProducts } from "@/features/admin/queries/useProductQuery";
import { formatCurrency } from "@/features/admin/utils";
import type { ProductWithRelations } from "@/types/index";
import { DeleteProductDialog } from "./delete-product-dialog";

export function ProductsTable() {
  const { data: productsData, isPending, isError, refetch } = useProducts();

  const columns: ColumnDef<ProductWithRelations>[] = [
    {
      accessorKey: "title",
      header: "Nama Produk",
    },
    {
      accessorKey: "slug",
      header: "Slug",
    },
    {
      accessorKey: "sku",
      header: "SKU",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        if (!row.original.category) return "-";

        return row.original.category?.name;
      },
    },
    {
      accessorKey: "price_cents",
      header: "Harga",
      cell: ({ row }) => {
        const price_cents = row.getValue("price_cents") as number;

        return <span>{formatCurrency(price_cents)}</span>;
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const inventories = row.original.product_variants
          .map((variant) => variant.inventory?.[0])
          .filter(Boolean);

        // Menjumlahkan stok
        const totalStock = inventories.reduce(
          (sum, inv) => sum + (inv?.stock_quantity ?? 0),
          0,
        );

        return (
          <span
            className={totalStock === 0 ? "text-destructive font-medium" : ""}
          >
            {totalStock}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex gap-2">
            <Link href={`/dashboard/products/${product.id}/edit`}>
              <Button variant="ghost" size="sm">
                <Edit2 className="w-4 h-4" />
              </Button>
            </Link>
            <DeleteProductDialog productId={row.original.id}>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </DeleteProductDialog>
          </div>
        );
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Produk</h3>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <DataTableSkeleton />
        ) : isError ? (
          <ErrorAlert
            description="Gagal mendapatkan data produk"
            action={() => refetch()}
          />
        ) : (
          <DataTable
            columns={columns}
            data={productsData}
            searchPlaceholder="Cari berdasarkan nama produk or SKU..."
            searchKey={["title", "sku", "category.name"]}
          />
        )}
      </CardContent>
    </Card>
  );
}
