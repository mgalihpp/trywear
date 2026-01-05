"use client";

import { Button } from "@repo/ui/components/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { VariantsTable } from "@/features/admin/components/products/variants-table";

export default function VariantsPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Varian</h1>
          <p className="text-muted-foreground mt-2">
            Manejemen varian produk
          </p>
        </div>
        <Link href="/dashboard/variants/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Varian
          </Button>
        </Link>
      </div>

      <VariantsTable />
    </div>
  );
}
