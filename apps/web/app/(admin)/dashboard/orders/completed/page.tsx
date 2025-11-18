import { OrdersTable } from "@/features/admin/components/orders/orders-table";

export default function OrdersPage() {
  return (
    <div className="p-0 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pesanan</h1>
        <p className="text-muted-foreground mt-2">
          Lacak dan kelola semua pesanan pelanggan
        </p>
      </div>

      <OrdersTable status="delivered" />
    </div>
  );
}
