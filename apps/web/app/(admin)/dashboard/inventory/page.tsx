import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { InventoryStats } from "@/features/admin/components/inventory/inventory-stats";
import { InventoryTable } from "@/features/admin/components/inventory/inventory-table";

export default function InventoryPage() {
  return (
    <div className="p-0 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Manajemen Inventory
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor stok dan manajemen inventory
          </p>
        </div>
        <Link href="/dashboard/inventory/movements">
          <Button variant="outline">Lihat Log Pergerakan</Button>
        </Link>
      </div>

      <InventoryStats />
      <InventoryTable />
    </div>
  );
}
