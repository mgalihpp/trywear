import { create } from "zustand";
import type { AddressStore } from "@/types/index";

export const useAddressStore = create<AddressStore>((set) => ({
  addresses: [],

  setAddresses: (data) => set({ addresses: data }),

  addAddress: (address) =>
    set((state) => ({
      addresses: [...state.addresses, address],
    })),

  updateAddress: (id, updatedData) =>
    set((state) => ({
      addresses: state.addresses.map((addr) =>
        addr.id === id ? { ...addr, ...updatedData } : addr,
      ),
    })),

  deleteAddress: (id) =>
    set((state) => ({
      addresses: state.addresses.filter((addr) => addr.id !== id),
    })),

  setDefaultAddress: (id) =>
    set((state) => ({
      addresses: state.addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    })),
}));
