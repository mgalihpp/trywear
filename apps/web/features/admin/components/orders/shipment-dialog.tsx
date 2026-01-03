"use client";

import { ShipmentStatus, type ShipmentStatusType } from "@repo/schema";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { useQueryClient } from "@tanstack/react-query";
import { Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUpdateOrderStatus } from "@/features/order/queries/useOrderQuery";
import type { OrderWithRelations } from "@/types/index";

const shipmentStatusLabels: Record<ShipmentStatusType, string> = {
  ready: "Siap",
  pending: "Menunggu",
  processing: "Diproses",
  shipped: "Dikirim",
  in_transit: "Dalam Perjalanan",
  delivered: "Terkirim",
  failed: "Gagal",
  returned: "Dikembalikan",
  cancelled: "Dibatalkan",
};

interface ShipmentDialogProps {
  order: OrderWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShipmentDialog({
  order,
  open,
  onOpenChange,
}: ShipmentDialogProps) {
  const [status, setStatus] = useState<ShipmentStatusType>("ready");
  const [trackingNumber, setTrackingNumber] = useState("");
  const updateStatusMutation = useUpdateOrderStatus();
  const qc = useQueryClient();

  useEffect(() => {
    if (order) {
      setStatus(order.status as ShipmentStatusType);
      setTrackingNumber(order.shipments?.[0]?.tracking_number ?? "");
    }
  }, [order]);

  const handleUpdate = () => {
    if (!order) return;

    updateStatusMutation.mutate(
      {
        orderId: order.id,
        input: {
          status: status,
          tracking_number: trackingNumber,
        },
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ["orders"] });
          toast.success("Informasi pengiriman diperbarui");
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Gagal memperbarui informasi pengiriman");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Atur Pengiriman
          </DialogTitle>
          <DialogDescription>
            Perbarui status pengiriman dan nomor resi untuk pesanan #{order?.id}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status Pengiriman</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as ShipmentStatusType)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                {ShipmentStatus.options.map((s) => (
                  <SelectItem key={s} value={s}>
                    {shipmentStatusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tracking">Nomor Resi (Tracking Number)</Label>
            <Input
              id="tracking"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Masukkan nomor resi..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateStatusMutation.isPending}
          >
            Batal
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
