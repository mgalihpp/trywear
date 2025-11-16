"use client";

import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { ImageIcon, Tag } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/features/admin/utils";
import type { CartItem } from "@/features/cart/types/cart.types";

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  isProcessing: boolean;
  onCheckout: () => void;
}

export function CheckoutOrderSummary({
  items,
  subtotal,
  tax,
  shipping,
  total,
  isProcessing,
  onCheckout,
}: CheckoutOrderSummaryProps) {
  const [coupon, setCoupon] = useState("");

  return (
    <Card className="p-3 sm:p-4 lg:p-6 lg:sticky lg:top-20">
      <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-4 sm:mb-6">
        Ringkasan Pesanan
      </h2>

      {/* Items Preview */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b max-h-[200px] overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex gap-2 sm:gap-3 text-xs sm:text-sm">
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
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="coupon-code"
              type="text"
              placeholder="Masukkan kode kupon"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="pl-10 max-sm:placeholder:text-xs "
            />
          </div>

          <Button
            variant="outline"
            className="text-xs sm:text-sm flex-shrink-0"
          >
            Gunakan
          </Button>
        </div>
      </div>

      <Button
        onClick={onCheckout}
        disabled={isProcessing || items.length === 0}
        className="w-full mb-3"
        size="lg"
      >
        {isProcessing ? "Processing..." : "Place Order"}
      </Button>
    </Card>
  );
}
