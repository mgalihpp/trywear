"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Eye, Package, RotateCcw } from "lucide-react";
import Link from "next/link";
import { ErrorAlert } from "@/features/admin/components/error-alert";
import { formatCurrency } from "@/features/admin/utils";
import { useReturns } from "@/features/order/queries/useReturnQuery";

// Status labels dan colors
const returnStatusLabels: Record<string, string> = {
  requested: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
  processing: "Diproses",
  completed: "Selesai",
};

const returnStatusColors: Record<string, string> = {
  requested: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  approved: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  rejected: "bg-red-500/20 text-red-600 border-red-500/30",
  processing: "bg-purple-500/20 text-purple-600 border-purple-500/30",
  completed: "bg-green-500/20 text-green-600 border-green-500/30",
};

export default function ReturnsPage() {
  const { data: returns, isPending, isError, refetch } = useReturns();

  // Count by status
  const statusCounts = returns?.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pengembalian</h1>
        <p className="text-muted-foreground mt-2">
          Kelola permintaan pengembalian produk dari pelanggan
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{returns?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">
              Menunggu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {statusCounts?.requested || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">
              Disetujui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {statusCounts?.approved || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">
              Diproses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">
              {statusCounts?.processing || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Selesai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {statusCounts?.completed || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Daftar Pengembalian
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <TableSkeleton />
          ) : isError ? (
            <ErrorAlert
              description="Gagal memuat data pengembalian."
              action={() => refetch()}
            />
          ) : returns?.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                Belum ada permintaan pengembalian
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Return</TableHead>
                    <TableHead>Pesanan</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returns?.map((returnItem) => (
                    <TableRow key={returnItem.id}>
                      <TableCell className="font-mono text-sm">
                        {returnItem.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/orders/${returnItem.order_id}`}
                          className="text-primary hover:underline"
                        >
                          #{returnItem.order_id?.slice(0, 8)}...
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {returnItem.user?.name || "-"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {returnItem.user?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(returnItem.created_at),
                          "dd MMM yyyy",
                          {
                            locale: id,
                          },
                        )}
                      </TableCell>
                      <TableCell>
                        {returnItem.return_items?.length || 0} item
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={returnStatusColors[returnItem.status]}
                        >
                          {returnStatusLabels[returnItem.status] ||
                            returnItem.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/returns/${returnItem.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-16" />
        </div>
      ))}
    </div>
  );
}
