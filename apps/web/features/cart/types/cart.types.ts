// features/cart/types/cart.types.ts

export interface CartItem {
  id: string;
  variant_id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  storage?: string;
  color?: string;
  size?: string;
}

export interface CartState {
  items: CartItem[];

  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, variant_id: string) => void;
  updateQuantity: (id: string, variant_id: string, quantity: number) => void;

  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}
