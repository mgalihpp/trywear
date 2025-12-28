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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";

import { useState } from "react";
import { DataTable } from "@/features/admin/components/data-table";
import { DataTableSkeleton } from "@/features/admin/components/data-table-skeleton";
import {
  useCoupons,
  useDeleteCoupon,
} from "@/features/admin/queries/useCouponQuery";
import { formatCurrency, formatDate } from "@/features/admin/utils";
import type { Coupon } from "@/types/index";
import { CouponUsageDialog } from "./coupon-usage-dialog";

export function CouponsTable() {
  const { data: coupons, isPending, isError } = useCoupons();
  const deleteMutation = useDeleteCoupon();
  const [usageCouponId, setUsageCouponId] = useState<string | null>(null);

  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: "code",
      header: "Kode Kupon",
      cell: ({ row }) => (
        <div className="font-mono font-bold">{row.original.code}</div>
      ),
    },
    {
      accessorKey: "discount_type",
      header: "Tipe Diskon",
      cell: ({ row }) => {
        const type = row.original.discount_type;
        return (
          <Badge variant={type === "percentage" ? "default" : "secondary"}>
            {type === "percentage" ? "Persentase" : "Nominal Tetap"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "discount_value",
      header: "Nilai",
      cell: ({ row }) => {
        const type = row.original.discount_type;
        const val = row.original.discount_value || 0;
        return (
          <div className="font-medium">
            {type === "percentage" ? `${val}%` : formatCurrency(val)}
          </div>
        );
      },
    },
    {
      accessorKey: "usage_limit",
      header: "Pemakaian",
      cell: ({ row }) => {
        const limit = row.original.usage_limit;
        const used = row.original._count?.orders || 0;

        return (
          <div className="flex items-center gap-1">
            <span className="font-medium">{used}</span>
            <span className="text-muted-foreground">/</span>
            {limit ? (
              <span>{limit}</span>
            ) : (
              <span className="text-muted-foreground italic">∞</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "expires_at",
      header: "Kadaluarsa",
      cell: ({ row }) => {
        const date = row.original.expires_at;
        if (!date) return "-";
        return formatDate(date);
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/coupons/${row.original.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Kupon
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setUsageCouponId(row.original.id)}>
              <MoreHorizontal className="mr-2 h-4 w-4" />
              Lihat Riwayat
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                if (confirm("Apakah Anda yakin ingin menghapus kupon ini?")) {
                  deleteMutation.mutate(row.original.id);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus Kupon
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isPending) return <DataTableSkeleton />;
  if (isError) return <div>Gagal memuat data kupon.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Kupon</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={coupons || []}
          searchKey="code"
          searchPlaceholder="Cari kode kupon..."
        />
      </CardContent>

      <CouponUsageDialog
        open={!!usageCouponId}
        onOpenChange={(open) => !open && setUsageCouponId(null)}
        couponId={usageCouponId}
      />
    </Card>
  );
}
