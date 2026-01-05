"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type SupplierInput, supplierSchema } from "@repo/schema";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Edit,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DataTable } from "@/features/admin/components/data-table";
import { DataTableSkeleton } from "@/features/admin/components/data-table-skeleton";
import { ErrorAlert } from "@/features/admin/components/error-alert";
import { api } from "@/lib/api";
import type { Supplier } from "@/types/index";

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const form = useForm<SupplierInput>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contact_email: "",
      phone: "",
    },
  });

  const {
    data: suppliers,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => api.supplier.getAll(),
  });

  // Reset form when dialog closes or editing changes
  useEffect(() => {
    if (!isDialogOpen) {
      form.reset({
        name: "",
        contact_email: "",
        phone: "",
      });
      setEditingSupplier(null);
    }
  }, [isDialogOpen, form]);

  const createMutation = useMutation({
    mutationFn: api.supplier.create,
    onSuccess: () => {
      toast.success("Supplier berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Gagal menambahkan supplier",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SupplierInput> }) =>
      api.supplier.update(id, data),
    onSuccess: () => {
      toast.success("Supplier berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Gagal memperbarui supplier",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.supplier.delete,
    onSuccess: () => {
      toast.success("Supplier berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Gagal menghapus supplier. Pastikan pemasok tidak memiliki produk.",
      );
    },
  });

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.reset({
      name: supplier.name,
      contact_email: supplier.contact_email || "",
      phone: supplier.phone || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: SupplierInput) => {
    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "name",
      header: "Nama Pemasok",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium text-foreground">
          <User className="w-4 h-4 text-muted-foreground" />
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "contact_email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.getValue("contact_email") as string;
        return email ? (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            {email}
          </div>
        ) : (
          <span className="text-muted-foreground italic text-sm">N/A</span>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Telepon",
      cell: ({ row }) => {
        const phone = row.getValue("phone") as string;
        return phone ? (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            {phone}
          </div>
        ) : (
          <span className="text-muted-foreground italic text-sm">N/A</span>
        );
      },
    },
    {
      accessorKey: "_count.products",
      header: "Produk",
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-mono">
          {row.original._count?.products ?? 0} Item
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Buka menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Pemasok
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                if (
                  confirm(
                    "Anda yakin ingin menghapus supplier ini secara permanen?",
                  )
                ) {
                  deleteMutation.mutate(row.original.id);
                }
              }}
            >
              <Trash2 className="text-destructive mr-2 h-4 w-4" />
              Hapus Pemasok
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Daftar Pemasok
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Kelola kerjasama dan data inventaris dari pemasok Anda.
          </p>
        </div>
        <Button
          onClick={() => {
            setIsDialogOpen(true);
          }}
          className="gap-2 shadow-lg hover:shadow-xl transition-all"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          Tambah Pemasok
        </Button>
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">Semua Pemasok</CardTitle>
          <CardDescription>
            Menampilkan {suppliers?.length ?? 0} pemasok terpercaya dalam
            sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <DataTableSkeleton columns={4} rows={5} />
          ) : isError ? (
            <ErrorAlert
              description="Gagal memuat data pemasok."
              action={() => refetch()}
            />
          ) : (
            <DataTable
              columns={columns}
              data={suppliers ?? []}
              searchKey="name"
              searchPlaceholder="Cari berdasarkan nama pemasok..."
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {editingSupplier ? "Perbarui Pemasok" : "Daftarkan Pemasok"}
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  {editingSupplier
                    ? `Mengubah informasi untuk ${editingSupplier.name}`
                    : "Silakan lengkapi detail pemasok baru di bawah ini."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        Nama Perusahaan/Pemasok
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="PT. Sinergi Logistik"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Email Resmi</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="support@partner.com"
                          className="h-11"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Opsional, digunakan untuk keperluan korespondensi.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        No. WhatsApp/Telepon
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+62 812 3456 789"
                          className="h-11"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-8">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 sm:flex-none"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex-1 sm:flex-none px-8"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Memproses..."
                    : editingSupplier
                      ? "Simpan Perubahan"
                      : "Daftarkan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
