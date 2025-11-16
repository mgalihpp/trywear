"use client";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/features/admin/utils";
import { useCartStore } from "@/features/cart/store/useCartStore";
import type { CartItem as CartItemType } from "@/features/cart/types/cart.types";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCartStore();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (value > 0) {
      updateQuantity(item.id, value);
    }
  };

  const incrementQuantity = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const decrementQuantity = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <div className="flex items-start gap-4 border-b pb-4 w-full">
      {/* Image */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          fill
          className="object-contain"
        />
      </div>

      {/* Middle Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm text-foreground truncate">
            {item.name}
          </h3>

          <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
            {item.color && <span>{item.color}</span>}
            {item.size && <span>{item.size}</span>}
            {item.storage && <span>{item.storage}</span>}
          </div>
        </div>

        <p className="mt-2 font-medium text-sm text-foreground">
          {formatCurrency(item.price * item.quantity)}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex flex-col items-end flex-shrink-0 gap-2">
        {/* Remove */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeFromCart(item.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        {/* Quantity Box */}
        <div className="flex items-center border rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={decrementQuantity}
            className="h-7 w-7 p-0"
          >
            <Minus className="w-3 h-3" />
          </Button>

          <span className="w-6 text-center text-sm">{item.quantity}</span>

          <Button
            variant="ghost"
            size="icon"
            onClick={incrementQuantity}
            className="h-7 w-7 p-0"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
