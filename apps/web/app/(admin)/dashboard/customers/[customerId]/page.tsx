"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Mail, MapPin, User } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { ErrorAlert } from "@/features/admin/components/error-alert";
import { NotFoundAlert } from "@/features/admin/components/not-found-alert";
import { formatCurrency, formatDate, isNotFoundError } from "@/features/admin/utils";
import { api } from "@/lib/api";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Menunggu", className: "bg-gray-100 text-gray-800" },
  processing: { label: "Diproses", className: "bg-yellow-100 text-yellow-800" },
  shipped: { label: "Dikirim", className: "bg-blue-100 text-blue-800" },
  delivered: {
    label: "Terkirim",
    className: "bg-emerald-100 text-emerald-800",
  },
  completed: { label: "Selesai", className: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Dibatalkan", className: "bg-red-100 text-red-800" },
  returned: {
    label: "Dikembalikan",
    className: "bg-orange-100 text-orange-800",
  },
};

export default function CustomerDetailPage() {
  const router = useRouter();
  const { customerId } = useParams();

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    status: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: customer.name,
    email: customer.email,
    status: customer.status,
  });

  const { data: customerData, isLoading, isError, error } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => api.customer.getById(customerId as string),
    enabled: !!customerId,
  });

  useEffect(() => {
    if (customerData) {
      setCustomer({
        name: customerData.name,
        email: customerData.email,
        status: customerData.banned ? "Diblokir" : "Aktif",
      });
      setFormData({
        name: customerData.name,
        email: customerData.email,
        status: customerData.banned ? "Diblokir" : "Aktif",
      });
    }
  }, [customerData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setCustomer((prev) => ({ ...prev, ...formData }));
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="p-0 md:p-8 space-y-6">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information Skeleton */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-9 w-16" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Addresses Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-3 border rounded-md space-y-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Orders Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <div className="text-right space-y-1">
                        <Skeleton className="h-5 w-24 ml-auto" />
                        <Skeleton className="h-5 w-20 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {/* Statistics Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-8 w-20 mt-1" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-20" />
              </CardHeader>
              <CardContent className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    if (isNotFoundError(error)) {
      return (
        <NotFoundAlert
          title="Pelanggan Tidak Ditemukan"
          description="Pelanggan yang Anda cari tidak dapat ditemukan."
          backUrl="/dashboard/customers"
        />
      );
    }

    return (
      <div className="p-8">
        <ErrorAlert
          description="Gagal memuat detail pelanggan."
          action={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!customerData) {
    return (
      <NotFoundAlert
        title="Pelanggan Tidak Ditemukan"
        description="Pelanggan yang Anda cari tidak dapat ditemukan."
        backUrl="/dashboard/customers"
      />
    );
  }

  return (
    <div className="p-0 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {customerData?.name}
        </h1>
        <p className="text-muted-foreground mt-2">
          Profile pelanggan dan riwayat pesanan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Informasi Pelanggan</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Batal" : "Edit"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label className="block text-sm font-medium mb-2">
                      Name
                    </Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium mb-2">
                      Email
                    </Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium mb-2">
                      Status
                    </Label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="Active">Aktif</option>
                      <option value="Inactive">Tidak Aktif</option>
                    </select>
                  </div>
                  <Button onClick={handleSave} className="w-full">
                    Simpan Perubahan
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nama</p>
                      <p className="font-medium">{customerData?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{customerData?.email}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      variant={
                        customer.status === "Active" ? "default" : "secondary"
                      }
                    >
                      {customer.status}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Alamat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customerData?.addresses.map((addr) => (
                <div key={addr.id} className="p-4 border rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {addr.label || "Alamat"}
                      </span>
                      {addr.is_default && (
                        <Badge variant="default">Utama</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{addr.recipient_name}</p>
                    {addr.phone && (
                      <p className="text-muted-foreground">{addr.phone}</p>
                    )}
                    <p>{addr.address_line1}</p>
                    {addr.address_line2 && <p>{addr.address_line2}</p>}
                    <p>
                      {[addr.city, addr.province, addr.postal_code]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {addr.country && addr.country !== "Indonesia" && (
                      <p>{addr.country}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pesanan Terakhir</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/orders">Lihat Semua</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {!customerData?.orders || customerData.orders.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Belum ada pesanan
                </div>
              ) : (
                <div className="space-y-4">
                  {customerData.orders.slice(0, 5).map((order) => {
                    const status = statusConfig[order.status] || {
                      label: order.status,
                      className: "bg-gray-100 text-gray-800",
                    };

                    return (
                      <Link
                        key={order.id}
                        href={`/dashboard/orders/${order.id}`}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">#{order.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {customerData.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(
                              new Date(order.created_at ?? new Date()),
                              {
                                addSuffix: true,
                                locale: idLocale,
                              },
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            {formatCurrency(Number(order.total_cents))}
                          </p>
                          <Badge className={status.className}>
                            {status.label}
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Pesanan</p>
                <p className="text-2xl font-bold">
                  {customerData?.orders.length ?? 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Pengeluaran
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    customerData?.orders
                      .filter((order) => order.status === "delivered")
                      .reduce(
                        (acc, order) => acc + Number(order.total_cents),
                        0,
                      ) ?? 0,
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bergabung Sejak</p>
                <p className="font-medium">
                  {formatDate(customerData?.createdAt)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-transparent" variant="outline">
                Kirim Email
              </Button>
              <Button
                className="w-full bg-transparent"
                variant="outline"
                onClick={() => router.push("/dashboard/orders")}
              >
                Liat semua pesanan
              </Button>
              <Link href="/dashboard/customers" className="block">
                <Button className="w-full bg-transparent" variant="outline">
                  Kembali ke pelanggan
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
