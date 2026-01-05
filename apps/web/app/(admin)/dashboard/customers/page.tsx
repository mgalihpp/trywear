"use client";

import { Button } from "@repo/ui/components/button";
import { Download } from "lucide-react";
import { CustomersTable } from "@/features/admin/components/customers/customers-table";

export default function CustomersPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pelanggan</h1>
          <p className="text-muted-foreground mt-2">
            Melihat dan mengelola informasi pelanggan
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      <CustomersTable />
    </div>
  );
}
