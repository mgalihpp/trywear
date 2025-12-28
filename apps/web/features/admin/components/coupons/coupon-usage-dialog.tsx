"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Calendar, User } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/features/admin/utils";
import { api } from "@/lib/api";

interface CouponUsageDialogProps {
  couponId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CouponUsageDialog({
  couponId,
  open,
  onOpenChange,
}: CouponUsageDialogProps) {
  const { data: usage, isLoading } = useQuery({
    queryKey: ["coupon-usage", couponId],
    queryFn: () => {
      if (!couponId) return [];
      return api.coupon.getUsage(couponId);
    },
    enabled: !!couponId && open,
  });

  const [search, setSearch] = useState("");

  const filteredUsage = usage?.filter(
    (item) =>
      item.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Riwayat Pemakaian Kupon</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Menampilkan {filteredUsage?.length || 0} dari {usage?.length || 0}{" "}
            riwayat terakhir.
          </p>
        </DialogHeader>

        <div className="px-1 py-2">
          <input
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Cari user atau order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsage && filteredUsage.length > 0 ? (
            <div className="space-y-4">
              {filteredUsage.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={item.user?.image || ""} />
                      <AvatarFallback>
                        {item.user?.name?.substring(0, 2).toUpperCase() || (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {item.user?.name || "Guest User"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Order #{item.id.substring(0, 8)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrency(Number(item.total_cents))}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Belum ada pemakaian untuk kupon ini.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
