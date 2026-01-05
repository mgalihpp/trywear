"use client";

import { Button } from "@repo/ui/components/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ProductsTable } from "@/features/admin/components/products/products-table";

export default function ProductsPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produk</h1>
          <p className="text-muted-foreground mt-2">
            Kelola katalog produk Anda
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Produk
          </Button>
        </Link>
      </div>

      <ProductsTable />
    </div>
  );
}
