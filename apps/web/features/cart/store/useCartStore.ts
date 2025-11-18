import { create } from "zustand";
import type { CartState } from "@/features/cart/types/cart.types";

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addToCart: (newItem) =>
    set((state) => {
      // PASTIKAN SEMUA FIELD WAJIB ADA — KALAU GAK ADA LANGSUNG SKIP
      if (
        !newItem.id ||
        !newItem.variant_id ||
        !newItem.name ||
        !newItem.image ||
        typeof newItem.price !== "number" ||
        typeof newItem.quantity !== "number"
      ) {
        console.warn("Invalid cart item, skipped:", newItem);
        return state;
      }

      const existingIndex = state.items.findIndex(
        (i) => i.id === newItem.id && i.variant_id === newItem.variant_id,
      );

      if (existingIndex !== -1) {
        // Item sudah ada → tambah quantity
        return {
          items: state.items.map((item, idx) =>
            idx === existingIndex
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item,
          ),
        };
      }

      // Item baru → tambah ke array
      return {
        items: [...state.items, newItem],
      };
    }),

  removeFromCart: (id: string, variant_id: string) =>
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.id === id && i.variant_id === variant_id),
      ),
    })),

  updateQuantity: (id: string, variant_id: string, quantity: number) =>
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter(
            (i) => !(i.id === id && i.variant_id === variant_id),
          ),
        };
      }
      return {
        items: state.items.map((i) =>
          i.id === id && i.variant_id === variant_id ? { ...i, quantity } : i,
        ),
      };
    }),

  clearCart: () => set({ items: [] }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
