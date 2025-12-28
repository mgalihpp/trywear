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
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DataTable } from "@/features/admin/components/data-table";
import {
  paymentStatusColors,
  statusColors,
} from "@/features/order/constants/shipment";
import { api } from "@/lib/api";
import type { OrderWithRelations } from "@/types/index";
import { formatCurrency, formatDate } from "../../utils";
import { DataTableSkeleton } from "../data-table-skeleton";
import { ErrorAlert } from "../error-alert";
import { ShipmentDialog } from "./shipment-dialog";

type OrdersTableProps = {
  status?: string;
};

export function OrdersTable({ status }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(
    null,
  );
  const [isShipmentDialogOpen, setIsShipmentDialogOpen] = useState(false);

  const {
    data: ordersData,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["orders", status],
    queryFn: () => api.order.getAll(status),
  });

  const columns: ColumnDef<OrderWithRelations>[] = [
    {
      accessorKey: "id",
      enableGlobalFilter: true,
      header: "Order ID",
      cell: ({ row }) => {
        return row.original.id;
      },
    },
    {
      accessorKey: "user",
      header: "Nama Pelanggan",
      cell: ({ row }) => {
        const customer = row.original.user;

        return <span>{customer?.name}</span>;
      },
    },
    {
      accessorKey: "order_items",
      header: "Jumlah Barang",
      cell: ({ row }) => {
        const items = row.original.order_items;
        return <span>{items.length}</span>;
      },
    },
    {
      accessorKey: "total_cents",
      header: "Total Harga",
      cell: ({ row }) => {
        const amount = Number(row.original.total_cents);
        return <span>{formatCurrency(amount)}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Shipment Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={statusColors[status as keyof typeof statusColors]}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "payments",
      header: "Payment Status",
      cell: ({ row }) => {
        const status = row.original.payments[0]?.status;
        return (
          <Badge
            className={
              paymentStatusColors[status as keyof typeof paymentStatusColors]
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Tanggal",
      cell: ({ row }) => {
        return <span>{formatDate(row.original.created_at)}</span>;
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Buka menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi Pesanan</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Detail
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsShipmentDialogOpen(true);
                  }}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Atur Pengiriman
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Pesanan</h3>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <DataTableSkeleton />
        ) : isError ? (
          <ErrorAlert
            description="Gagal mendapatkan data order"
            action={() => refetch()}
          />
        ) : (
          <DataTable
            columns={columns}
            data={ordersData}
            searchPlaceholder="Cari berdasarkan nama order ID atau customer..."
            searchKey={["id", "user.name"]}
          />
        )}
      </CardContent>
      <ShipmentDialog
        open={isShipmentDialogOpen}
        onOpenChange={setIsShipmentDialogOpen}
        order={selectedOrder}
      />
    </Card>
  );
}
