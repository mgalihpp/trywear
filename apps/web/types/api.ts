export type ApiResponse<T = unknown> = {
  message: string;
  success: boolean;
  data: T;
  error?: string;
  errors?: { field: string; message: string }[];
  errorCode?: string;
};

interface OrderItem {
  id: number;
  order_id: string;
  variant_id: string;
  sku: string;
  title: string;
  unit_price_cents: number;
  quantity: number;
  total_price_cents: number;
}

interface Order {
  id: string;
  user_id: string;
  address_id: number;
  status: string;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  discount_cents: number;
  total_cents: number;
  coupon_code: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

interface Payment {
  provider_payment_id: string;
}

interface Snap {
  token: string;
  redirect_url: string;
}

export interface SnapPayload {
  order: Order;
  payment: Payment;
  snap: Snap;
}
