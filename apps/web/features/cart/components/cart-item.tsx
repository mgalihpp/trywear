"use client";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
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
    <div className="flex gap-4 border-b pb-4">
      {/* Product Image */}
      <div className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{item.name}</h3>

        {/* Attributes */}
        <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
          {item.color && <span>{item.color}</span>}
          {item.size && <span>{item.size}</span>}
          {item.storage && <span>{item.storage}</span>}
        </div>

        <div className="mt-2 font-medium text-foreground">
          ${(item.price * item.quantity).toFixed(2)}
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeFromCart(item.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2 border rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={decrementQuantity}
            className="h-8 w-8 p-0"
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Input
            type="number"
            value={item.quantity}
            onChange={handleQuantityChange}
            className="w-12 h-8 text-center border-0 p-0"
            min="1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={incrementQuantity}
            className="h-8 w-8 p-0"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
