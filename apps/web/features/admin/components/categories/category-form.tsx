"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type CreateCategoryInput,
  createCategorySchema,
} from "@repo/schema/categorySchema";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
} from "@/features/admin/queries/useCategoryQuery";
import type { CategoryWithRelations } from "@/types/index";

interface CategoryFormProps {
  initialData?: CategoryWithRelations;
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const { data: categories } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isEditing = !!initialData;

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      parent_id: initialData?.parent_id || undefined,
    },
  });

  const onSubmit = (data: CreateCategoryInput) => {
    if (isEditing) {
      updateMutation.mutate(
        { id: initialData.id, input: data },
        {
          onSuccess: () => router.push("/dashboard/categories"),
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => router.push("/dashboard/categories"),
      });
    }
  };

  // Filter available parent categories (cannot be the category itself when editing)
  const availableParents =
    categories?.filter((c) => c.id !== initialData?.id) || [];

  return (
    <div className="p-0 md:p-8 space-y-6">
      <div className="max-md:p-4">
        <h1 className="text-3xl font-bold text-foreground">
          {isEditing ? "Edit Kategori" : "Tambah Kategori"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEditing
            ? "Ubah informasi kategori atau sub-kategori produk"
            : "Tambahkan kategori baru ke katalog Anda"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild className="w-fit">
                        <CardTitle className="flex items-center gap-2 cursor-help border-dashed border-b border-foreground text-xl">
                          Informasi Dasar
                        </CardTitle>
                      </TooltipTrigger>
                      <TooltipContent className="w-48">
                        Berisi data utama kategori seperti nama, slug, dan induk
                        kategori.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid lg:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium mb-2">
                            Nama Kategori
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="misal, Elektronik" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium mb-2">
                            Slug
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="misal, elektronik" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="parent_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium mb-2">
                          Induk Kategori
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(val) =>
                              field.onChange(
                                val === "none" ? undefined : Number(val),
                              )
                            }
                            defaultValue={
                              field.value ? String(field.value) : "none"
                            }
                          >
                            <SelectTrigger className="w-full h-11">
                              <SelectValue placeholder="Pilih induk kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                Utama (Tanpa Induk)
                              </SelectItem>
                              {availableParents.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={String(category.id)}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Pilih jika kategori ini merupakan sub-kategori.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium mb-2">
                          Deskripsi
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Deskripsi kategori..."
                            rows={6}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 sticky top-20 h-fit">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={isEditing ? "default" : "secondary"}>
                      {isEditing ? "Aktif" : "Draft (Kategori Baru)"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    Kategori yang diterbitkan akan langsung dapat digunakan saat
                    Anda menambahkan produk baru.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Aksi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full gap-2 font-semibold h-11"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {!isEditing && <Plus className="w-4 h-4" />}
                    {isEditing ? "Simpan Perubahan" : "Tambah Kategori"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent h-11"
                    onClick={() => router.push("/dashboard/categories")}
                  >
                    Batalkan
                  </Button>
                </CardContent>
                <CardFooter className="pt-0 flex flex-col items-start gap-1 text-[10px] text-muted-foreground uppercase tracking-tight">
                  <p>ID: {initialData?.id || "AUTO-GENERATE"}</p>
                </CardFooter>
              </Card>

              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-2">
                <h4 className="text-sm font-semibold text-primary">Tips</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Struktur kategori yang baik membantu pelanggan menemukan
                  produk lebih cepat melalui fitur filter dan navigasi.
                </p>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
