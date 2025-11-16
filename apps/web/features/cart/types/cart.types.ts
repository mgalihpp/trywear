export interface CartItem {
  id: string;
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
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}
