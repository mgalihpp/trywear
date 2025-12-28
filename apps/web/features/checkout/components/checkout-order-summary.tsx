"use client";

import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, ImageIcon, Tag, Ticket } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/features/admin/utils";
import type { CartItem } from "@/features/cart/types/cart.types";
import { api } from "@/lib/api";

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  isProcessing: boolean;
  onCheckout: () => void;
  onCouponChange?: (code: string) => void;
  onApplyDiscount?: (amount: number) => void;
  segmentDiscount?: number;
  segmentName?: string;
}

export function CheckoutOrderSummary({
  items,
  subtotal,
  tax,
  shipping,
  total,
  isProcessing,
  onCheckout,
  onCouponChange,
  onApplyDiscount,
  segmentDiscount = 0,
  segmentName,
}: CheckoutOrderSummaryProps) {
  const [coupon, setCoupon] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    amount: number;
  } | null>(null);

  const { data: availableCoupons } = useQuery({
    queryKey: ["coupons", "available"],
    queryFn: () => api.coupon.getAvailable(),
  });

  const handleApplyCoupon = async (codeToApply: string) => {
    if (!codeToApply) {
      toast.error("Masukkan kode kupon");
      return;
    }

    setIsValidating(true);
    try {
      const result = await api.coupon.validate(codeToApply, subtotal);

      setAppliedCoupon({
        code: result.coupon.code,
        amount: result.discountAmount,
      });

      // Update parent
      onCouponChange?.(result.coupon.code);
      onApplyDiscount?.(result.discountAmount);

      toast.success(
        `Kupon ${result.coupon.code} diterapkan! Hemat ${formatCurrency(result.discountAmount)}`,
      );
      setCoupon(result.coupon.code);
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error?.response?.data?.message ||
        "Kupon tidak valid atau tidak memenuhi syarat";
      toast.error(errorMessage);

      // Reset if failed
      setAppliedCoupon(null);
      onApplyDiscount?.(0);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="p-3 sm:p-4 lg:p-6 lg:sticky lg:top-20">
      <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-4 sm:mb-6">
        Ringkasan Pesanan
      </h2>

      {/* Items Preview */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b max-h-[200px] overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.variant_id}
            className="flex gap-2 sm:gap-3 text-xs sm:text-sm"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
              {item.image ? (
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-xs sm:text-sm">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Jumlah: {item.quantity} Ukuran: {item.size} Warna:{" "}
                  {item.color}
                </p>
              </div>
              <div className="flex-shrink-0">
                <p className="font-medium text-xs sm:text-sm">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Pajak (10%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Biaya Pengiriman</span>
          <span>{formatCurrency(shipping)}</span>
        </div>

        {segmentDiscount > 0 && (
          <div className="flex justify-between text-xs sm:text-sm text-blue-600 font-medium animate-in fade-in slide-in-from-top-1">
            <span className="flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5" />
              Diskon Segmen ({segmentName})
            </span>
            <span>-{formatCurrency(segmentDiscount)}</span>
          </div>
        )}

        {appliedCoupon && (
          <div className="flex justify-between text-xs sm:text-sm text-green-600 font-medium animate-in fade-in slide-in-from-top-1">
            <span className="flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5" />
              Diskon ({appliedCoupon.code})
            </span>
            <span>-{formatCurrency(appliedCoupon.amount)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <span className="font-semibold text-sm sm:text-base">Total</span>
        <span className="text-xl sm:text-2xl font-bold text-primary">
          {formatCurrency(total)}
        </span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coupon-code" aria-hidden className="hidden">
          Kode Kupon
        </Label>
        <div className="flex flex-col gap-3 w-full">
          {/* Coupon Input Group */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="coupon-code"
                type="text"
                placeholder="Kode kupon"
                value={coupon}
                onChange={(e) => {
                  setCoupon(e.target.value);
                  // Only sync with parent if manually typing, but validation triggers the "real" sync
                }}
                className="pl-10 max-sm:placeholder:text-xs"
                disabled={isValidating || !!appliedCoupon}
              />
            </div>

            {appliedCoupon ? (
              <Button
                variant="outline"
                className="text-xs sm:text-sm flex-shrink-0 text-destructive hover:bg-destructive/10 border-destructive/20"
                onClick={() => {
                  setAppliedCoupon(null);
                  setCoupon("");
                  onCouponChange?.("");
                  onApplyDiscount?.(0);
                }}
              >
                Hapus
              </Button>
            ) : (
              <Button
                variant="outline"
                className="text-xs sm:text-sm flex-shrink-0"
                disabled={isValidating || !coupon}
                onClick={() => handleApplyCoupon(coupon)}
              >
                {isValidating ? "..." : "Gunakan"}
              </Button>
            )}
          </div>

          {/* Available Coupons Dropdown */}
          {availableCoupons &&
            availableCoupons.length > 0 &&
            !appliedCoupon && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between h-auto py-2 text-xs text-muted-foreground border border-dashed"
                  >
                    <span className="flex items-center gap-2">
                      <Ticket className="w-3.5 h-3.5" />
                      Lihat kupon tersedia ({availableCoupons.length})
                    </span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <div className="p-2 space-y-1 max-h-[200px] overflow-y-auto">
                    {availableCoupons.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        className="w-full text-left flex items-start gap-3 p-2 rounded-md hover:bg-muted transition-colors group"
                        onClick={() => handleApplyCoupon(c.code)}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{c.code}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {c.discount_type === "percentage"
                              ? `Diskon ${c.discount_value}%`
                              : `Potongan ${formatCurrency(c.discount_value || 0)}`}
                          </p>
                        </div>
                        {coupon === c.code && (
                          <Check className="w-4 h-4 text-primary mt-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
        </div>
      </div>

      <Button
        onClick={onCheckout}
        disabled={isProcessing || items.length === 0}
        className="w-full mb-3"
        size="lg"
      >
        {isProcessing ? "Memproses..." : "Tempatkan Pesanan"}
      </Button>
    </Card>
  );
}
