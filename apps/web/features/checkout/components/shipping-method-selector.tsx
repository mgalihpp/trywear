"use client";

import { Card } from "@repo/ui/components/card";
import { Label } from "@repo/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { Package, Truck } from "lucide-react";
import { formatCurrency } from "@/features/admin/utils";
import type { ShippingMethod } from "@/types/index";

interface ShippingMethodSelectorProps {
  methods: ShippingMethod[];
  selectedMethodId: string | null;
  onSelect: (id: string) => void;
}

export function ShippingMethodSelector({
  methods,
  selectedMethodId,
  onSelect,
}: ShippingMethodSelectorProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-sm sm:text-base lg:text-lg font-semibold">
        Metode Pengiriman
      </h2>
      <RadioGroup value={selectedMethodId || ""} onValueChange={onSelect}>
        <div className="space-y-2 sm:space-y-3">
          {methods.map((method) => (
            <Card
              key={method.id}
              className={`p-3 sm:p-4 cursor-pointer transition-all ${
                selectedMethodId === method.id
                  ? "border-primary ring-1 ring-primary"
                  : "hover:border-foreground/50"
              }`}
              onClick={() => onSelect(method.id)}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <RadioGroupItem
                  value={method.id}
                  id={`shipping-${method.id}`}
                  className="mt-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor={`shipping-${method.id}`}
                    className="cursor-pointer block"
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                        {method.name.includes("Express") ? (
                          <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        ) : (
                          <Package className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs sm:text-sm lg:text-base break-words">
                          {method.name}
                        </div>
                        <div className="text-xs text-muted-foreground break-words">
                          {method.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {method.estimatedDays} business day
                          {method.estimatedDays > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-xs sm:text-sm lg:text-base text-primary">
                    +{formatCurrency(method.price)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
