import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Progress } from "@repo/ui/components/progress";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { getStockPercentage, getStockStatus } from "@/features/admin/utils";
import type { VariantCombination, VariantOption } from "@/types/index";
import { CurrencyInput } from "./currency-input";

type StockCardProps = {
  combo: VariantCombination;
  variantOptions: VariantOption[];
  updateVariantStock: (
    sku: string,
    field:
      | "additional_price_cents"
      | "stock_quantity"
      | "reserved_quantity"
      | "safety_stock",
    value: number,
  ) => void;
};

export const StockCard = ({
  combo,
  variantOptions,
  updateVariantStock,
}: StockCardProps) => {
  const stockStatus = getStockStatus(combo);
  const stockPercentage = getStockPercentage(combo);
  const availableStock = combo.stock_quantity - combo.reserved_quantity;

  return (
    <Card className="border-border shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1">
            <div className="font-mono text-sm text-muted-foreground mb-2">
              SKU: {combo.sku}
            </div>
            <div className="flex flex-wrap gap-2">
              {variantOptions.map((option) => (
                <Badge
                  key={option.name}
                  variant="secondary"
                  className="font-medium"
                >
                  {combo.option_values[option.name]}
                </Badge>
              ))}
            </div>
          </div>
          <Badge
            variant={stockStatus.color as any}
            className="shrink-0 flex items-center gap-1"
          >
            {stockStatus.status === "good" ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            {stockStatus.label}
          </Badge>
        </div>

        {/* Stock Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Stock Level</span>
            <span className="font-semibold">
              {availableStock} / {combo.stock_quantity}
            </span>
          </div>
          <Progress
            value={stockPercentage}
            className="h-2"
            indicatorClassName={
              stockStatus.status === "out"
                ? "bg-secondary"
                : stockStatus.status === "critical"
                  ? "bg-red-500"
                  : stockStatus.status === "low"
                    ? "bg-yellow-500"
                    : "bg-green-500"
            }
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Additional Price */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Harga Tambahan</Label>
          <CurrencyInput
            value={combo.additional_price_cents}
            onValueChange={(value) =>
              updateVariantStock(combo.sku, "additional_price_cents", value)
            }
          />
        </div>

        {/* Stock Inputs Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Total Stok
            </Label>
            <Input
              type="number"
              min="0"
              value={combo.stock_quantity}
              onChange={(e) =>
                updateVariantStock(
                  combo.sku,
                  "stock_quantity",
                  parseInt(e.target.value) || 0,
                )
              }
              className="text-center font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Dipesan
            </Label>
            <Input
              type="number"
              min="0"
              value={combo.reserved_quantity}
              onChange={(e) =>
                updateVariantStock(
                  combo.sku,
                  "reserved_quantity",
                  parseInt(e.target.value) || 0,
                )
              }
              className="text-center"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Stok Aman
            </Label>
            <Input
              type="number"
              min="0"
              value={combo.safety_stock}
              onChange={(e) =>
                updateVariantStock(
                  combo.sku,
                  "safety_stock",
                  parseInt(e.target.value) || 0,
                )
              }
              className="text-center"
            />
          </div>
        </div>

        {/* Available Stock Display */}
        <div className="pt-3 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Stok Tersedia</span>
            <span className="text-lg font-bold">{availableStock}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
