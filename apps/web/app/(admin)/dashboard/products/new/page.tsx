"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema } from "@repo/schema";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Form,
  FormControl,
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { useProductMediaUpload } from "@/features/upload/hooks/useProductMediaUpload";
import { api } from "@/lib/api";
import type { VariantCombination, VariantOption } from "@/types/index";
import { CategoryCombobox } from "../_components/category-combobox";
import { CurrencyInput } from "../_components/currency-input";
import { ProductImageUpload } from "../_components/product-image-upload";
import { ProductVariantsSection } from "../_components/product-variant-sections";
import { SupplierSelect } from "../_components/supplier-select";

export default function CreateProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof createProductSchema>>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      title: "",
      sku: "",
      slug: "",
      description: "",
      status: "draft",
      price_cents: 0,
      category_id: undefined,
      supplier_id: undefined,
    },
  });

  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const [variantCombinations, setVariantCombinations] = useState<
    VariantCombination[]
  >([]);
  const {
    attachments,
    setAttachments,
    isUploading,
    startUpload,
    removeAttachment,
    reset,
    uploadProgress,
  } = useProductMediaUpload();

  /* State untuk stok produk simple (tanpa varian) */

  const [simpleStock, setSimpleStock] = useState(0);

  const createProductMutation = useMutation({
    mutationFn: api.product.create,
    onSuccess: (data) => {
      // Mapping variant agar ada product_id
      const variantsPayload = variantCombinations.map((v) => ({
        ...v,
        product_id: data.id,
      }));

      /**
       * Jika ada varian, buat varian-varian tersebut.
       * Jika TIDAK ada varian, buat 1 varian default (simple product) agar stok bisa disimpan.
       */
      if (variantCombinations.length > 0) {
        createProductVariantsMutation.mutate(variantsPayload);
      } else {
        // Buat default variant untuk simple product
        createProductVariantsMutation.mutate([
          {
            product_id: data.id,
            sku: form.getValues("sku"), // Gunakan SKU produk utama
            price_cents: form.getValues("price_cents"),
            stock_quantity: simpleStock,
            option_values: {}, // Kosong karena tidak ada opsi varian
            additional_price_cents: 0,
          } as any, // Casting any karena tipe VariantCombination mungkin strict
        ]);
      }

      // Ini akan dijalankan jika gambar yang diunggah lebih dari 0
      if (attachments.length > 0) {
        const imagesPayload = attachments.map((a, index) => ({
          product_id: data.id,
          url: a.url as string,
          key: a.key as string,
          alt: a.file.name,
          sort_order: index,
        }));

        createProductImagesMutation.mutate(imagesPayload);
      }

      toast.success("Product Created!");
      setAttachments([]);

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      // Redirect ke product tabel
      router.push("/dashboard/products");
    },
    onError: () => {
      toast.error("Gagal membuat produk");
    },
  });

  const createProductVariantsMutation = useMutation({
    mutationFn: api.product.createVariant,
  });

  const createProductImagesMutation = useMutation({
    mutationFn: api.product.createImages,
  });

  const handleSubmit = (data: z.infer<typeof createProductSchema>) => {
    createProductMutation.mutate({
      title: data.title,
      price_cents: data.price_cents,
      sku: data.sku,
      slug: data.slug,
      description: data?.description,
      status: data.status,
      category_id: data.category_id,
      supplier_id: data.supplier_id,
    });
  };

  useEffect(() => {
    setAttachments([]);
  }, [setAttachments]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  };

  const generateSku = (title: string) => {
    const words = title.split(" ");
    let sku = words.map((word) => word.charAt(0).toUpperCase()).join("");
    sku += "-" + Math.floor(100 + Math.random() * 900).toString();
    return sku;
  };

  // Hitung total stok dari varian jika ada
  const totalVariantStock = variantCombinations.reduce(
    (total, v) => total + (v.stock_quantity ?? 0),
    0,
  );

  return (
    <div className="p-0 md:p-8 space-y-6">
      <div className="max-md:p-4">
        <h1 className="text-3xl font-bold text-foreground">Tambah Produk</h1>
        <p className="text-muted-foreground mt-2">
          Tambahkan produk baru ke katalog Anda
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild className="w-fit">
                        <CardTitle className="flex items-center gap-2 cursor-help border-dashed border-b border-foreground">
                          Informasi Dasar
                        </CardTitle>
                      </TooltipTrigger>
                      <TooltipContent className="w-48">
                        Berisi data utama produk seperti nama, kategori, dan
                        deskripsi singkat.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid lg:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium mb-2">
                            Nama Produk
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="misal, Baju Kasual"
                            />
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
                            <Input
                              {...field}
                              placeholder="misal, baju-kasual"
                              onBlur={() => {
                                const title = form.getValues("title");
                                if (!field.value && title) {
                                  const generatedSlug = generateSlug(title);
                                  form.setValue("slug", generatedSlug);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid lg:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium mb-2">
                            SKU
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="misal, MW-001"
                              onBlur={() => {
                                const title = form.getValues("title");
                                if (!field.value && title) {
                                  const generatedSku = generateSku(title);
                                  form.setValue("sku", generatedSku);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium mb-2">
                            Kategori
                          </FormLabel>
                          <FormControl>
                            <CategoryCombobox
                              value={field.value}
                              onValueChange={(value) => {
                                form.setValue("category_id", value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="supplier_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium mb-2">
                            Pemasok
                          </FormLabel>
                          <FormControl>
                            <SupplierSelect
                              value={field.value}
                              onValueChange={(value) => {
                                form.setValue("supplier_id", value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
                            placeholder="Deskripsi produk..."
                            rows={4}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Pricing & Inventory */}
              <Card>
                <CardHeader>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild className="w-fit">
                        <CardTitle className="flex items-center gap-2 cursor-help border-dashed border-b border-foreground">
                          Penetapan Harga & Inventaris
                        </CardTitle>
                      </TooltipTrigger>
                      <TooltipContent className="w-56">
                        Atur harga jual produk dan kelola jumlah stok yang
                        tersedia di inventaris.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid lg:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price_cents"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium mb-2">
                            Harga (IDR)
                          </FormLabel>
                          <FormControl>
                            <CurrencyInput
                              value={field.value}
                              onValueChange={(val) => {
                                form.setValue("price_cents", val);
                              }}
                              placeholder="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                      <FormLabel className="block text-sm font-medium mb-2">
                        Stok Produk
                      </FormLabel>
                      <Input
                        name="stock"
                        type="number"
                        placeholder="0"
                        min={0}
                        value={
                          variantCombinations.length > 0
                            ? totalVariantStock
                            : simpleStock
                        }
                        onChange={(e) => {
                          // Hanya izinkan edit jika tidak ada varian
                          if (variantCombinations.length === 0) {
                            setSimpleStock(Number(e.target.value));
                          }
                        }}
                        readOnly={variantCombinations.length > 0}
                        className={
                          variantCombinations.length > 0 ? "bg-muted" : ""
                        }
                      />
                      {variantCombinations.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          *Stok dihitung otomatis dari total varian
                        </p>
                      )}
                    </FormItem>
                  </div>
                </CardContent>
              </Card>

              <ProductVariantsSection
                sku={form.getValues("sku")}
                variantOptions={variantOptions}
                setVariantOptions={setVariantOptions}
                variantCombinations={variantCombinations}
                setVariantCombinations={setVariantCombinations}
              />

              {/* Product Images */}
              <ProductImageUpload
                attachments={attachments}
                isUploading={isUploading}
                onUpload={startUpload}
                onRemove={removeAttachment}
                onReset={reset}
                uploadProgress={uploadProgress}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6 sticky top-20 h-fit">
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium mb-2">
                          Status produk
                        </FormLabel>
                        <FormControl>
                          <Select {...field} onValueChange={field.onChange}>
                            <SelectTrigger
                              className="w-full"
                              aria-invalid={fieldState.invalid}
                            >
                              <SelectValue placeholder="Pilih status produk" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Aktif</SelectItem>
                              <SelectItem value="inactive">
                                Tidak aktif
                              </SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <Badge
                      variant={
                        form.watch("status") === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {form.watch("status") === "active"
                        ? "Aktif"
                        : form.watch("status") === "inactive"
                          ? "Tidak aktif"
                          : "Draf"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Aksi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      !form.formState.isDirty ||
                      createProductMutation.isPending ||
                      createProductVariantsMutation.isPending ||
                      attachments.some((a) => a.isUploading)
                    }
                  >
                    {createProductMutation.isPending ||
                    createProductVariantsMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Produk
                      </>
                    )}
                  </Button>
                  <Link href="/dashboard/products" className="block">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent"
                    >
                      Batal
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
