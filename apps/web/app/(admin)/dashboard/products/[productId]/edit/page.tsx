"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type UpdateProductInput,
  type UpdateVariantInput,
  updateProductSchema,
} from "@repo/schema";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { ErrorAlert } from "@/features/admin/components/error-alert";
import { NotFoundAlert } from "@/features/admin/components/not-found-alert";
import { DeleteProductDialog } from "@/features/admin/components/products/delete-product-dialog";
import { isNotFoundError } from "@/features/admin/utils";
import { useProductMediaUpload } from "@/features/upload/hooks/useProductMediaUpload";
import { api } from "@/lib/api";
import type { VariantCombination, VariantOption } from "@/types/index";
import { CategoryCombobox } from "../../_components/category-combobox";
import { CurrencyInput } from "../../_components/currency-input";
import { ProductImageUpload } from "../../_components/product-image-upload";
import { ProductVariantsSection } from "../../_components/product-variant-sections";
import { SupplierSelect } from "../../_components/supplier-select";
import { EditProductSkeleton } from "./edit-product-skeleton";

export default function EditProductPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const { productId } = params;

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

  // Fetch product data first
  const {
    data: productData,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => api.product.getById(productId as string),
  });

  // Track if form has been initialized with product data
  const isFormInitialized = useRef(false);

  const form = useForm<z.infer<typeof updateProductSchema>>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      title: "",
      sku: "",
      slug: "",
      description: "",
      price_cents: 0,
      status: "draft",
      category_id: undefined,
      supplier_id: undefined,
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: UpdateProductInput;
    }) => api.product.update(productId, data),
    onSuccess: async (data) => {
      if (!productData) return;

      const existingVariants = productData.product_variants;
      const currentVariantIds = variantCombinations
        .filter((v) => v.id)
        .map((v) => v.id);

      // --- DELETE old variants that no longer exist ---
      const variantsToDelete = existingVariants.filter(
        (v) => !currentVariantIds.includes(v.id),
      );

      await Promise.all(
        variantsToDelete.map((v) =>
          deleteProductVariantMutation.mutateAsync({
            variantId: v.id,
          }),
        ),
      );

      // --- UPDATE & CREATE ---
      const variantsPayload = variantCombinations.map((v) => ({
        ...v,
        product_id: data.id,
      }));

      await Promise.all(
        variantsPayload.map(async (variant) => {
          if (variant.id) {
            await updateProductVariantsMutation.mutateAsync({
              variantId: variant.id,
              data: {
                additional_price_cents: variant.additional_price_cents,
                reserved_quantity: variant.reserved_quantity,
                safety_stock: variant.safety_stock,
                stock_quantity: variant.stock_quantity,
                option_values: variant.option_values,
              },
            });
          } else {
            await createProductVariantsMutation.mutateAsync([variant]);
          }
        }),
      );

      // filter hanya gambar baru (belum ada di database)
      const newAttachments = attachments.filter((a) => !a.id);

      if (newAttachments.length > 0) {
        const uniqueAttachments = Array.from(
          new Map(newAttachments.map((a) => [a.key, a])).values(),
        );

        const imagesPayload = uniqueAttachments.map((a, index) => ({
          product_id: data.id,
          url: a.url as string,
          key: a.key as string,
          alt: a.file.name,
          sort_order: index,
        }));

        await createProductImagesMutation.mutateAsync(imagesPayload);
      }

      queryClient.refetchQueries({
        queryKey: ["product", productId],
      });

      queryClient.refetchQueries({
        queryKey: ["products"],
      });

      toast.success("Product Updated!");
    },
    onError: () => {
      toast.error("Gagal memperbarui produk");
    },
  });

  const createProductVariantsMutation = useMutation({
    mutationFn: api.product.createVariant,
  });

  const updateProductVariantsMutation = useMutation({
    mutationFn: ({
      variantId,
      data,
    }: {
      variantId: string;
      data: UpdateVariantInput;
    }) => api.product.updateVariant(variantId, data),
  });

  const createProductImagesMutation = useMutation({
    mutationFn: api.product.createImages,
  });

  const deleteProductVariantMutation = useMutation({
    mutationFn: ({ variantId }: { variantId: string }) =>
      api.product.deleteVariant(variantId),
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // Only reset form ONCE when productData first becomes available and hasn't been initialized yet
    if (productData && !isFormInitialized.current) {
      isFormInitialized.current = true;

      form.reset({
        title: productData.title ?? "",
        sku: productData.sku ?? "",
        slug: productData.slug ?? "",
        description: productData.description ?? "",
        price_cents: Number(productData.price_cents ?? 0),
        status: productData.status?.toLowerCase() || "draft",
        category_id: productData.category_id ?? undefined,
        supplier_id: productData.supplier_id ?? undefined,
      });

      // Set attachments dari product images
      setAttachments(
        productData.product_images.map((i) => ({
          id: i.id,
          file: new File([i.url], i.alt ?? "image"),
          key: i.key,
          url: i.url,
          isUploading: false,
        })),
      );
    }
  }, [productData?.id]); // Hanya trigger ketika product ID berubah

  useEffect(() => {
    if (productData) {
      const combinations = productData.product_variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku ?? "",
        additional_price_cents: Number(variant.additional_price_cents),
        option_values: variant.option_values as Record<string, string>,
        reserved_quantity: variant.inventory[0]?.reserved_quantity ?? 0,
        stock_quantity: variant.inventory[0]?.stock_quantity ?? 0,
        safety_stock: variant.inventory[0]?.safety_stock ?? 0,
      }));

      setVariantCombinations(combinations);

      const optionMap: Record<string, Set<string>> = {};

      combinations.forEach((variant) => {
        Object.entries(variant.option_values).forEach(([optionName, value]) => {
          if (!optionMap[optionName]) {
            optionMap[optionName] = new Set();
          }
          optionMap[optionName].add(value);
        });
      });

      const reconstructedOptions: VariantOption[] = Object.entries(
        optionMap,
      ).map(([name, values]) => ({
        name,
        values: Array.from(values),
      }));

      setVariantOptions(reconstructedOptions);
    }
  }, [productData]);

  const handleSubmit = (data: z.infer<typeof updateProductSchema>) => {
    updateProductMutation.mutate({
      productId: productId as string,
      data: data,
    });
  };

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

  const isUpdating =
    updateProductMutation.isPending ||
    updateProductVariantsMutation.isPending ||
    attachments.some((a) => a.isUploading);

  if (isPending) {
    return <EditProductSkeleton />;
  }

  if (isError) {
    if (isNotFoundError(error)) {
      return (
        <NotFoundAlert
          title="Produk Tidak Ditemukan"
          description="Produk yang Anda cari tidak dapat ditemukan."
          backUrl="/dashboard/products"
        />
      );
    }

    return (
      <div className="p-8">
        <ErrorAlert
          description="Gagal memuat detail produk."
          action={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!productData) {
    return (
      <NotFoundAlert
        title="Produk Tidak Ditemukan"
        description="Produk yang Anda cari tidak dapat ditemukan."
        backUrl="/dashboard/products"
      />
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ubah Produk</h1>
        <p className="text-muted-foreground mt-2">
          Perbaharui informasi produk
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                              placeholder="misal, baju-kasual"
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
                              value={field.value ?? undefined}
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
                        Stock Quantity
                      </FormLabel>
                      <Input
                        name="stock"
                        type="number"
                        placeholder="0"
                        value={variantCombinations.reduce(
                          (total, v) => total + (v.stock_quantity ?? 0),
                          0,
                        )}
                        readOnly
                      />
                    </FormItem>
                  </div>
                </CardContent>
              </Card>

              <ProductVariantsSection
                sku={form.getValues("sku")!}
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
            <div className="space-y-6 sticky top-4 h-screen">
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field, fieldState }) => {
                      return (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium mb-2">
                            Status produk
                          </FormLabel>
                          <Select
                            value={field.value || "draft"}
                            onValueChange={(val) => {
                              // Ignore empty value from Radix SelectBubbleInput bug
                              if (val) {
                                field.onChange(val);
                              }
                            }}
                          >
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
                          <FormMessage />
                        </FormItem>
                      );
                    }}
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
                          ? "Tidak Aktif"
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
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                  <DeleteProductDialog productId={productId as string} />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
