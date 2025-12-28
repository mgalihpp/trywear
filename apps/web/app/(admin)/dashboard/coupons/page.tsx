"use client";

import { Button } from "@repo/ui/components/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { CouponsTable } from "@/features/admin/components/coupons/coupons-table";

export default function CouponsPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kupon</h1>
          <p className="text-muted-foreground">
            Kelola kode diskon dan promosi toko.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/coupons/new">
            <Plus className="mr-2 h-4 w-4" />
            Buat Kupon
          </Link>
        </Button>
      </div>
      <CouponsTable />
    </div>
  );
}
