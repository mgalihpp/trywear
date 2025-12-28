import { Badge } from "@repo/ui/components/badge";
import { formatCurrency } from "@/features/admin/utils";
import { statusColors } from "@/features/order/constants/shipment";
import type { OrderItem, VariantOptions } from "../types";

type OrderItemsCardProps = {
  items?: OrderItem[];
  orderStatus?: string | null;
  totals: {
    subtotal?: number | null;
    tax?: number | null;
    shipping?: number | null;
    discount?: number | null;
    total?: number | null;
  };
};

function VariantInfo({
  variant,
}: {
  variant?: { option_values?: unknown } | null;
}) {
  const opts =
    variant?.option_values &&
    typeof variant.option_values === "object" &&
    !Array.isArray(variant.option_values)
      ? (variant.option_values as VariantOptions)
      : null;

  if (!opts) return null;

  return (
    <>
      {opts.color && (
        <p className="text-sm text-muted-foreground">Warna: {opts.color}</p>
      )}
      {opts.size && (
        <p className="text-sm text-muted-foreground">Ukuran: {opts.size}</p>
      )}
    </>
  );
}

export function OrderItemsCard({
  items,
  orderStatus,
  totals,
}: OrderItemsCardProps) {
  const statusClass = orderStatus
    ? statusColors[orderStatus as keyof typeof statusColors]
    : "bg-muted text-foreground";

  return (
    <div className="border border-border p-8 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Detail Pesanan</h2>
        </div>
        <Badge className={statusClass}>{orderStatus}</Badge>
      </div>
      <div className="space-y-4">
        {items?.map((item) => (
          <div
            key={item.id}
            className="flex gap-6 pb-4 border-b border-border last:border-0 last:pb-0"
          >
            <div className="w-24 h-24 bg-secondary border border-border flex-shrink-0 rounded-md overflow-hidden">
              <img
                src={item.variant?.product?.product_images?.[0]?.url ?? ""}
                alt={item.title ?? ""}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-bold">{item.title}</h3>
              <VariantInfo variant={item.variant} />
              <p className="text-sm text-muted-foreground">
                Jumlah: {item.quantity}
              </p>
              <p className="font-bold mt-2">
                {formatCurrency(Number(item.total_price_cents))}{" "}
                {item.variant?.additional_price_cents &&
                Number(item.variant.additional_price_cents) > 0
                  ? `(+${formatCurrency(
                      Number(item.variant.additional_price_cents),
                    )})`
                  : ""}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 py-4 mt-4 border-t border-border">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">
            {formatCurrency(totals.subtotal ?? 0)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pajak</span>
          <span className="font-medium">{formatCurrency(totals.tax ?? 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pengiriman</span>
          <span className="font-medium">
            {formatCurrency(totals.shipping ?? 0)}
          </span>
        </div>
        {totals.discount && totals.discount > 0 && (
          <div className="flex justify-between text-destructive">
            <span>Diskon</span>
            <span className="font-medium">
              - {formatCurrency(totals.discount)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-xl font-bold pt-3">
          <span>Total</span>
          <span>{formatCurrency(totals.total ?? 0)}</span>
        </div>
      </div>
    </div>
  );
}
