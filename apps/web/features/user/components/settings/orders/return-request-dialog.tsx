"use client";

import type { OrderItems } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Progress } from "@repo/ui/components/progress";
import { Textarea } from "@repo/ui/components/textarea";
import { Camera, ImageIcon, Loader2, Minus, Plus, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCreateReturn } from "@/features/order/queries/useReturnQuery";
import { useUploadThing } from "@/lib/uploadthing";
import type { OrderWithFullRelations } from "@/types/index";

interface ReturnRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderWithFullRelations;
}

type SelectedItem = {
  order_item_id: number;
  quantity: number;
  maxQuantity: number;
  title: string;
};

type UploadedImage = {
  url: string;
  key: string;
  name: string;
};

const ReturnRequestDialog = ({
  open,
  onOpenChange,
  order,
}: ReturnRequestDialogProps) => {
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reason, setReason] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createReturnMutation = useCreateReturn();
  const isSubmitting = createReturnMutation.isPending;

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onUploadProgress: setUploadProgress,
    onClientUploadComplete: (res) => {
      const newImages = res.map((file) => ({
        url: file.ufsUrl,
        key: file.key,
        name: file.name,
      }));
      setUploadedImages((prev) => [...prev, ...newImages]);
      setUploadProgress(0);
      toast.success(`${res.length} foto berhasil diupload`);
    },
    onUploadError: (error) => {
      toast.error(error.message || "Gagal mengupload foto");
      setUploadProgress(0);
    },
  });

  const resetForm = () => {
    setReason("");
    setSelectedItems([]);
    setUploadedImages([]);
    setUploadProgress(0);
    setErrors({});
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const toggleItem = (item: OrderItems) => {
    const existing = selectedItems.find((s) => s.order_item_id === item.id);
    if (existing) {
      setSelectedItems(
        selectedItems.filter((s) => s.order_item_id !== item.id),
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          order_item_id: item.id,
          quantity: item.quantity,
          maxQuantity: item.quantity,
          title: item.title ?? "Produk",
        },
      ]);
    }
  };

  const updateQuantity = (itemId: number, delta: number) => {
    setSelectedItems(
      selectedItems.map((s) => {
        if (s.order_item_id === itemId) {
          const newQty = Math.max(
            1,
            Math.min(s.maxQuantity, s.quantity + delta),
          );
          return { ...s, quantity: newQty };
        }
        return s;
      }),
    );
  };

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      if (uploadedImages.length + files.length > 5) {
        toast.error("Maksimal 5 foto yang bisa diupload");
        return;
      }

      startUpload(files);
      e.target.value = "";
    },
    [uploadedImages.length, startUpload],
  );

  const removeImage = (key: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.key !== key));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (selectedItems.length === 0) {
      newErrors.items = "Pilih minimal 1 item untuk dikembalikan";
    }
    if (reason.length < 10) {
      newErrors.reason = "Alasan minimal 10 karakter";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createReturnMutation.mutateAsync(
        {
          order_id: order.id,
          reason,
          items: selectedItems.map((item) => ({
            order_item_id: item.order_item_id,
            quantity: item.quantity,
          })),
          images:
            uploadedImages.length > 0
              ? uploadedImages.map((img) => ({ url: img.url, key: img.key }))
              : undefined,
        },
        {
          onSuccess: () => {
            toast.success("Pengajuan pengembalian berhasil dikirim");
            handleClose();
          },
          onError: (error: any) => {
            const message =
              error?.response?.data?.message ||
              "Terjadi kesalahan saat mengajukan pengembalian";
            toast.error(message);
          },
        },
      );
    } catch {
      // Error handled in onError
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      {/* Info */}
      <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <p>
          Pengajuan pengembalian harus dilakukan dalam waktu{" "}
          <strong>7 hari</strong> setelah pesanan diterima.
        </p>
      </div>

      {/* Select Items */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Pilih Item untuk Dikembalikan *
        </Label>
        <div className="space-y-2">
          {order.order_items.map((item) => {
            const selected = selectedItems.find(
              (s) => s.order_item_id === item.id,
            );
            const isSelected = !!selected;
            const imageUrl = item.variant?.product?.product_images?.[0]?.url;

            return (
              <div
                key={item.id}
                className={`border rounded-lg p-3 transition-colors ${
                  isSelected ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleItem(item)}
                    className="mt-1"
                  />
                  <div className="w-12 h-12 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.title ?? ""}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dibeli: {item.quantity} pcs
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-3 flex items-center justify-between pl-8">
                    <span className="text-sm text-muted-foreground">
                      Jumlah dikembalikan:
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={selected.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={selected.quantity}
                        readOnly
                        className="w-14 h-8 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={selected.quantity >= selected.maxQuantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {errors.items && (
          <p className="text-sm text-destructive mt-1">{errors.items}</p>
        )}
      </div>

      {/* Reason */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Alasan Pengembalian *
        </Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Jelaskan alasan pengembalian produk (min. 10 karakter)..."
          rows={4}
          className="resize-none"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {reason.length}/500 karakter
        </p>
        {errors.reason && (
          <p className="text-sm text-destructive mt-1">{errors.reason}</p>
        )}
      </div>

      {/* Photo Upload */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Foto Bukti (Opsional)
        </Label>
        <p className="text-xs text-muted-foreground mb-3">
          Upload foto produk yang ingin dikembalikan (maks. 5 foto)
        </p>

        {isUploading && (
          <div className="mb-3">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Mengupload... {uploadProgress}%
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {uploadedImages.map((img) => (
            <div
              key={img.key}
              className="relative w-20 h-20 rounded-lg overflow-hidden border"
            >
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(img.key)}
                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}

          {uploadedImages.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Camera className="h-5 w-5" />
                  <span className="text-xs">Tambah</span>
                </>
              )}
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-11"
          onClick={handleClose}
          disabled={isSubmitting || isUploading}
        >
          Batal
        </Button>
        <Button
          type="submit"
          className="flex-1 h-11"
          disabled={isSubmitting || isUploading || selectedItems.length === 0}
        >
          {isSubmitting ? "Mengirim..." : "Ajukan Pengembalian"}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="w-full rounded-t-3xl px-6 pb-6 gap-0 max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold">
              Ajukan Pengembalian
            </DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-1">{formContent}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Ajukan Pengembalian
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default ReturnRequestDialog;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};
