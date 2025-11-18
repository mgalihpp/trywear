import type { Addresses, Prisma } from "@repo/db";

export interface VariantCombination {
  id?: string; // Ada kalo fetch dari data produk
  sku: string;
  option_values: Record<string, string>;
  stock_quantity: number;
  reserved_quantity: number;
  safety_stock: number;
  additional_price_cents: number;
}

export interface VariantOption {
  name: string;
  values: string[];
}

export interface Attachment {
  id?: number; // Unique Indentifier dari fetch
  file: File;
  key?: string;
  url?: string;
  isUploading: boolean;
}

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    product_variants: {
      include: {
        inventory: true;
      };
    };
    product_images: true;
    reviews: true;
  };
}>;

export type OrderWithRelations = Prisma.OrdersGetPayload<{
  include: {
    order_items: true;
    payments: true;
    user: true;
  };
}>;

export type OrderWithFullRelations = Prisma.OrdersGetPayload<{
  include: {
    address: true;
    order_items: {
      include: {
        variant: {
          include: {
            product: {
              include: {
                product_images: true;
              };
            };
          };
        };
      };
    };
    payments: true;
    returns: true;
    shipments: {
      include: {
        shipment_method: true;
      };
    };
    user: true;
  };
}>;

export type AddressStore = {
  addresses: Addresses[];
  setAddresses: (data: Addresses[]) => void;
  addAddress: (address: Addresses) => void;
  updateAddress: (id: number, updatedData: Partial<Addresses>) => void;
  deleteAddress: (id: number) => void;
  setDefaultAddress: (id: number) => void;
};

export type Region = "JABODETABEK" | "JAWA" | "LUAR_JAWA";

export type ShippingMethod = {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  estimatedDays: number;
  regionModifier: Record<Region, number>;
};

export type SortType = "none" | "newest" | "price-asc" | "price-desc";

export type FilterProps = {
  sort: SortType;
  category: number | null;
  colors: string[];
  sizes: string[];
  query: string;
  price: { isCustom: boolean; range: [number, number] };
  page: number;
  pageSize: number;
};
