import type { Inventory } from "@repo/db";
import type { ProductWithRelations } from "@/types/index";

// -------------------------
// Helpers
// -------------------------

export const parseOptions = (value: any) =>
  typeof value === "string" ? JSON.parse(value) : value;

export const findVariant = (
  product: ProductWithRelations,
  size: string,
  color: string,
) =>
  product.product_variants.find((v) => {
    const opts = parseOptions(v.option_values);
    return (
      opts?.size?.toLowerCase() === size.toLowerCase() &&
      opts?.color?.toLowerCase() === color.toLowerCase()
    );
  });

export const getVariantStock = (variant: { inventory: Inventory[] }) =>
  variant?.inventory?.reduce(
    (total, inv) =>
      total + (inv.stock_quantity - inv.reserved_quantity - inv.safety_stock),
    0,
  ) ?? 0;
