import type { Check } from "lucide-react";

export type StatusConfig = {
  icon: typeof Check;
  bgColor: string;
  textColor: string;
  title: string;
  message: string;
};

export type OrderStep = {
  icon: typeof Check;
  label: string;
  active: boolean;
  date: string | Date | null | undefined;
};

export type OrderItem = {
  id: string | number;
  title?: string | null;
  quantity: number;
  total_price_cents?: number | string | null;
  variant?: {
    option_values?: unknown;
    product: { product_images: Array<{ url: string }> };
    additional_price_cents?: number | string | null;
  } | null;
};

export interface VariantOptions {
  color?: string;
  size?: string;
}
