"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/alert-dialog";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Edit2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { DataTable } from "@/features/admin/components/data-table";
import { DataTableSkeleton } from "@/features/admin/components/data-table-skeleton";
import { ErrorAlert } from "@/features/admin/components/error-alert";
import { formatCurrency } from "@/features/admin/utils";
import { api } from "@/lib/api";
import type { CustomerSegment } from "@/types/index";

export default function SegmentsPage() {
  const queryClient = useQueryClient();

  const {
    data: segments,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["segments"],
    queryFn: () => api.segment.getAll(true),
  });

  const recalculateMutation = useMutation({
    mutationFn: api.segment.recalculate,
    onSuccess: (data) => {
      toast.success(`Berhasil memperbarui ${data.updated} pelanggan`);
      queryClient.invalidateQueries({ queryKey: ["segments"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: () => {
      toast.error("Gagal melakukan recalculate");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.segment.delete,
    onSuccess: () => {
      toast.success("Segment berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["segments"] });
    },
    onError: () => {
      toast.error("Gagal menghapus segment");
    },
  });

  const columns: ColumnDef<CustomerSegment>[] = [
    {
      accessorKey: "name",
      header: "Nama",
      cell: ({ row }) => {
        const segment = row.original;
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color || "#6b7280" }}
            />
            <span className="font-medium">{segment.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "slug",
      header: "Slug",
    },
    {
      accessorKey: "min_spend_cents",
      header: "Min. Spending",
      cell: ({ row }) => formatCurrency(Number(row.original.min_spend_cents)),
    },
    {
      accessorKey: "max_spend_cents",
      header: "Max. Spending",
      cell: ({ row }) =>
        row.original.max_spend_cents
          ? formatCurrency(Number(row.original.max_spend_cents))
          : "∞",
    },
    {
      accessorKey: "discount_percent",
      header: "Diskon",
      cell: ({ row }) => `${row.original.discount_percent}%`,
    },
    {
      accessorKey: "_count.users",
      header: "Pelanggan",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-muted-foreground" />
          {row.original._count?.users || 0}
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const segment = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/customers/segments/${segment.id}`}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Segment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini akan menghapus segment &quot;{segment.name}
                      &quot; dan melepaskan semua pelanggan dari segment ini.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate(segment.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="p-0 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Segmen Pelanggan
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola segmen pelanggan berdasarkan total spending
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => recalculateMutation.mutate()}
            disabled={recalculateMutation.isPending}
          >
            <RefreshCw
              className={`w-4 h-4 ${recalculateMutation.isPending ? "animate-spin" : ""}`}
            />
            Recalculate
          </Button>
          <Button asChild className="gap-2">
            <Link href="/dashboard/customers/segments/new">
              <Plus className="w-4 h-4" />
              Tambah Segment
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Segment</CardTitle>
          <CardDescription>
            Segment pelanggan diurutkan berdasarkan prioritas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <DataTableSkeleton />
          ) : isError ? (
            <ErrorAlert
              description="Gagal mendapatkan data segment"
              action={() => refetch()}
            />
          ) : (
            <DataTable
              columns={columns}
              data={segments || []}
              searchPlaceholder="Cari segment..."
              searchKey={["name", "slug"]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
