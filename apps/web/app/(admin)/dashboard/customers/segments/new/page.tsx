"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Switch } from "@repo/ui/components/switch";
import { Textarea } from "@repo/ui/components/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CurrencyInput } from "@/app/(admin)/dashboard/products/_components/currency-input";
import { api } from "@/lib/api";

const SEGMENT_COLORS = [
  { name: "Gray", value: "#6b7280" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Yellow", value: "#eab308" },
  { name: "Lime", value: "#84cc16" },
  { name: "Green", value: "#22c55e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Brown", value: "#4a2b0eff" },
];

export default function NewSegmentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    min_spend_cents: 0,
    max_spend_cents: null as number | null,
    discount_percent: 0,
    color: "#6b7280",
    icon: "",
    priority: 0,
    is_active: true,
  });

  const createMutation = useMutation({
    mutationFn: api.segment.create,
    onSuccess: () => {
      toast.success("Segment berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["segments"] });
      router.push("/dashboard/customers/segments");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membuat segment");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  return (
    <div className="p-0 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Tambah Segment Baru
          </h1>
          <p className="text-muted-foreground mt-1">
            Buat segment baru untuk mengelompokkan pelanggan
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Dasar</CardTitle>
                <CardDescription>
                  Masukkan nama dan deskripsi segment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Segment</Label>
                    <Input
                      id="name"
                      placeholder="Contoh: VIP"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setFormData({
                          ...formData,
                          name,
                          slug: generateSlug(name),
                        });
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      placeholder="vip"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    placeholder="Deskripsi segment..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kriteria Spending</CardTitle>
                <CardDescription>
                  Tentukan range spending untuk segment ini
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_spend">Minimum Spending</Label>
                    <CurrencyInput
                      id="min_spend"
                      value={formData.min_spend_cents}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          min_spend_cents: value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_spend">
                      Maximum Spending (opsional)
                    </Label>
                    <CurrencyInput
                      id="max_spend"
                      value={formData.max_spend_cents ?? 0}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          max_spend_cents: value > 0 ? value : null,
                        })
                      }
                      placeholder="Tidak terbatas"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Benefit & Tampilan</CardTitle>
                <CardDescription>
                  Atur diskon dan tampilan badge segment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount">Diskon (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={formData.discount_percent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_percent: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioritas</Label>
                    <Input
                      id="priority"
                      type="number"
                      placeholder="0"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Warna Badge</Label>
                  <div className="flex flex-wrap gap-2">
                    {SEGMENT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color.value
                            ? "border-foreground scale-110"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() =>
                          setFormData({ ...formData, color: color.value })
                        }
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
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
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_active">Status Aktif</Label>
                    <p className="text-xs text-muted-foreground">
                      Segment aktif akan digunakan untuk klasifikasi pelanggan
                    </p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview Badge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-white text-sm font-medium"
                    style={{ backgroundColor: formData.color }}
                  >
                    {formData.name || "Nama Segment"}
                  </span>
                </div>
                {formData.discount_percent > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Diskon: {formData.discount_percent}%
                  </p>
                )}
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
                  disabled={createMutation.isPending}
                >
                  <Save className="w-4 h-4" />
                  {createMutation.isPending ? "Menyimpan..." : "Simpan Segment"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent h-11"
                  asChild
                >
                  <Link href="/dashboard/customers/segments">Batalkan</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-2">
              <h4 className="text-sm font-semibold text-primary">Tips</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Buat segment berdasarkan total spending pelanggan untuk
                memberikan diskon dan benefit khusus kepada pelanggan loyal
                Anda.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
