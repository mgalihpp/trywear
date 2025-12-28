"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
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
import { DataTable } from "@/features/admin/components/data-table";
import { DataTableSkeleton } from "@/features/admin/components/data-table-skeleton";
import {
  useCategories,
  useDeleteCategory,
} from "@/features/admin/queries/useCategoryQuery";
import type { CategoryWithRelations } from "@/types/index";

export function CategoriesTable() {
  const { data: categories, isPending, isError } = useCategories();
  const deleteMutation = useDeleteCategory();

  const columns: ColumnDef<CategoryWithRelations>[] = [
    {
      accessorKey: "name",
      header: "Nama",
      cell: ({ row }) => (
        <div className="font-medium text-foreground">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
    },
    {
      accessorKey: "parent",
      header: "Induk Kategori",
      cell: ({ row }) => {
        const parent = row.original.parent;
        return parent ? (
          <Badge variant="outline" className="font-normal">
            {parent.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      },
    },
    {
      accessorKey: "children",
      header: "Sub-Kategori",
      cell: ({ row }) => {
        const count = row.original.children?.length ?? 0;
        return <span>{count} Sub</span>;
      },
    },
    {
      id: "products_count",
      header: "Produk",
      cell: ({ row }) => {
        return row.original._count?.products ?? 0;
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
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
              <Link href={`/dashboard/categories/${row.original.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Kategori
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                if (
                  window.confirm(
                    "Apakah Anda yakin ingin menghapus kategori ini?",
                  )
                ) {
                  deleteMutation.mutate(row.original.id);
                }
              }}
            >
              <Trash2 className="text-destructive mr-2 h-4 w-4" />
              Hapus Kategori
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isPending) return <DataTableSkeleton />;
  if (isError) return <div>Gagal memuat data kategori.</div>;

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Kategori Produk</h3>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={categories || []}
          searchPlaceholder="Cari kategori..."
          searchKey="name"
        />
      </CardContent>
    </Card>
  );
}
