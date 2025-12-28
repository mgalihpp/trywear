"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type CreateCouponInput,
  createCouponSchema,
} from "@repo/schema/couponSchema";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Calendar } from "@repo/ui/components/calendar";
import {
  Card,
  CardContent,
  CardDescription,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Check,
  Loader2,
  Plus,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  useCreateCoupon,
  useUpdateCoupon,
} from "@/features/admin/queries/useCouponQuery";
import { useSegments } from "@/features/admin/queries/useSegmentQuery";
import type { Coupon } from "@/types/index";

interface CouponFormProps {
  initialData?: Coupon;
}

export function CouponForm({ initialData }: CouponFormProps) {
  const router = useRouter();
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const { data: segments } = useSegments();

  const isEditing = !!initialData;

  const form = useForm<CreateCouponInput>({
    resolver: zodResolver(createCouponSchema),
    defaultValues: {
      code: initialData?.code || "",
      discount_type:
        (initialData?.discount_type as "percentage" | "fixed_amount") ||
        "percentage",
      discount_value: initialData?.discount_value || 0,
      usage_limit: initialData?.usage_limit ?? null,
      expires_at: initialData?.expires_at
        ? new Date(initialData.expires_at).toISOString()
        : null,
      segment_ids:
        initialData?.segment_coupons?.map((sc) => sc.segment_id) || [],
    },
  });

  const onSubmit = (data: CreateCouponInput) => {
    const formattedData = {
      ...data,
      expires_at: data.expires_at
        ? new Date(data.expires_at).toISOString()
        : null,
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: initialData.id, input: formattedData },
        {
          onSuccess: () => router.push("/dashboard/coupons"),
        },
      );
    } else {
      createMutation.mutate(formattedData, {
        onSuccess: () => router.push("/dashboard/coupons"),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-0 md:p-8 space-y-6">
      <div className="max-md:p-4">
        <h1 className="text-3xl font-bold text-foreground">
          {isEditing ? "Edit Kupon" : "Buat Kupon Baru"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEditing
            ? "Perbarui informasi kupon yang sudah ada."
            : "Buat kode diskon baru untuk pelanggan Anda."}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Kupon</CardTitle>
                  <CardDescription>
                    Detail dasar mengenai kode kupon dan diskonnya.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Kupon</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="misal. DISKON50"
                            className="uppercase font-mono"
                            onChange={(e) =>
                              field.onChange(e.target.value.toUpperCase())
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Kode unik yang akan dimasukkan pelanggan saat
                          checkout.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="discount_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipe Diskon</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih tipe" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="percentage">
                                Persentase (%)
                              </SelectItem>
                              <SelectItem value="fixed_amount">
                                Nominal Tetap (Rp)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discount_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nilai Diskon</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            {form.watch("discount_type") === "percentage"
                              ? "Masukkan persentase (1-100)"
                              : "Masukkan nominal dalam Rupiah"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Limits & Validity */}
              <Card>
                <CardHeader>
                  <CardTitle>Batasan & Validitas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="usage_limit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Batas Pemakaian</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === "" ? null : Number(val));
                              }}
                              placeholder="Kosongkan jika tidak terbatas"
                            />
                          </FormControl>
                          <FormDescription>
                            Jumlah maksimal kupon dapat digunakan.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expires_at"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Tanggal Berakhir</FormLabel>
                          <div className="flex gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                    )}
                                  >
                                    {field.value ? (
                                      format(new Date(field.value), "PPP", {
                                        locale: id,
                                      })
                                    ) : (
                                      <span>Pilih tanggal</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={
                                    field.value
                                      ? new Date(field.value)
                                      : undefined
                                  }
                                  onSelect={(date) => {
                                    if (date) {
                                      const current = field.value
                                        ? new Date(field.value)
                                        : new Date();
                                      date.setHours(
                                        current.getHours(),
                                        current.getMinutes(),
                                      );
                                      field.onChange(date.toISOString());
                                    }
                                  }}
                                  initialFocus
                                  locale={id}
                                />
                              </PopoverContent>
                            </Popover>
                            <Input
                              type="time"
                              className="w-[120px]"
                              value={
                                field.value
                                  ? format(new Date(field.value), "HH:mm")
                                  : ""
                              }
                              onChange={(e) => {
                                const timeStr = e.target.value;
                                if (timeStr) {
                                  const [hours = 0, minutes = 0] = timeStr
                                    .split(":")
                                    .map(Number);
                                  const date = field.value
                                    ? new Date(field.value)
                                    : new Date();
                                  date.setHours(hours, minutes);
                                  field.onChange(date.toISOString());
                                }
                              }}
                            />
                          </div>
                          <FormDescription>
                            Kupon tidak akan berlaku setelah tanggal ini.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Targeting */}
              <Card>
                <CardHeader>
                  <CardTitle>Target Segmen</CardTitle>
                  <CardDescription>
                    Pilih segmen pelanggan yang dapat menggunakan kupon ini.
                    Kosongkan untuk semua pelanggan.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="segment_ids"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-wrap gap-2">
                          {segments?.map((segment) => {
                            const isSelected = field.value?.includes(
                              segment.id,
                            );
                            return (
                              <Badge
                                key={segment.id}
                                variant={isSelected ? "secondary" : "outline"}
                                className={cn(
                                  "cursor-pointer px-3 py-1.5 text-sm font-medium transition-all hover:opacity-90 border-2",
                                  isSelected
                                    ? "border-transparent text-white"
                                    : "text-muted-foreground hover:border-primary/50",
                                )}
                                style={{
                                  backgroundColor:
                                    isSelected && segment.color
                                      ? segment.color
                                      : undefined,
                                  borderColor:
                                    isSelected && segment.color
                                      ? segment.color
                                      : undefined,
                                }}
                                onClick={() => {
                                  const current = field.value || [];
                                  if (isSelected) {
                                    field.onChange(
                                      current.filter((id) => id !== segment.id),
                                    );
                                  } else {
                                    field.onChange([...current, segment.id]);
                                  }
                                }}
                              >
                                {segment.name}
                                {isSelected && (
                                  <Check className="ml-1.5 h-3.5 w-3.5" />
                                )}
                              </Badge>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Sidebar */}
            <div className="space-y-6 sticky top-20 h-fit">
              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={isEditing ? "default" : "outline"}>
                      {isEditing ? "Aktif" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    {isEditing
                      ? "Kupon ini sedang aktif dan dapat digunakan oleh pelanggan sesuai ketentuan."
                      : "Kupon baru akan segera aktif setelah disimpan."}
                  </p>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Aksi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full gap-2 font-semibold h-11"
                    disabled={isPending}
                  >
                    {!isEditing && <Plus className="w-4 h-4" />}
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4" /> Simpan Perubahan
                      </>
                    ) : (
                      "Buat Kupon"
                    )}
                    {isPending && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent h-11"
                    onClick={() => router.push("/dashboard/coupons")}
                  >
                    Batalkan
                  </Button>
                </CardContent>
                <CardFooter className="pt-0 flex flex-col items-start gap-1 text-[10px] text-muted-foreground uppercase tracking-tight">
                  <p>ID: {initialData?.id || "AUTO-GENERATE"}</p>
                </CardFooter>
              </Card>

              {/* Tips */}
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-2">
                <h4 className="text-sm font-semibold text-primary">Tips</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Gunakan kode yang mudah diingat (misal: "MERDEKA45") dan
                  targetkan segmen pelanggan spesifik untuk meningkatkan
                  konversi.
                </p>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
