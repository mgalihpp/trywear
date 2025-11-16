"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DataTable } from "@/features/admin/components/data-table";
import { api } from "@/lib/api";
import type { OrderWithRelations } from "@/types/index";
import { formatCurrency, formatDate } from "../../utils";
import { DataTableSkeleton } from "../data-table-skeleton";
import { ErrorAlert } from "../error-alert";

interface Order {
  id: string;
  customer: string;
  date: string;
  amount: string;
  status: "Delivered" | "Shipped" | "Processing" | "Pending";
  items: number;
}

const orders: Order[] = [
  {
    id: "ORD-001",
    customer: "John Doe",
    date: "2025-01-20",
    amount: "$234.50",
    status: "Delivered",
    items: 2,
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    date: "2025-01-19",
    amount: "$567.80",
    status: "Shipped",
    items: 3,
  },
  {
    id: "ORD-003",
    customer: "Bob Johnson",
    date: "2025-01-18",
    amount: "$123.45",
    status: "Processing",
    items: 1,
  },
  {
    id: "ORD-004",
    customer: "Alice Brown",
    date: "2025-01-17",
    amount: "$890.12",
    status: "Pending",
    items: 4,
  },
  {
    id: "ORD-005",
    customer: "Charlie Wilson",
    date: "2025-01-16",
    amount: "$456.78",
    status: "Delivered",
    items: 2,
  },
];

const statusColors = {
  Delivered: "bg-emerald-100 text-emerald-800",
  Shipped: "bg-blue-100 text-blue-800",
  Processing: "bg-yellow-100 text-yellow-800",
  Pending: "bg-gray-100 text-gray-800",
};

export function OrdersTable() {
  // const [orders_list, setOrders] = useState<Order[]>(orders);

  const {
    data: ordersData,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: api.order.getAll,
  });

  const columns: ColumnDef<OrderWithRelations>[] = [
    {
      accessorKey: "id",
      enableGlobalFilter: true,
      header: "Order ID",
      cell: ({ row }) => {
        return row.original.id.slice(0, 10);
      },
    },
    {
      accessorKey: "user",
      header: "Pelanggan",
      cell: ({ row }) => {
        const customer = row.original.user;

        return <span>{customer?.name}</span>;
      },
    },
    {
      accessorKey: "order_items",
      header: "Barang",
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
      header: "Status",
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
          <div className="flex gap-2">
            <Link href={`/dashboard/orders/${order.id}`}>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm">
              <Truck className="w-4 h-4" />
            </Button>
          </div>
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
    </Card>
  );
}
