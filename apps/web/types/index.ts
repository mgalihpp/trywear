import type { Addresses, Prisma } from "@repo/db";

export type CategoryWithRelations = Prisma.CategoriesGetPayload<{
  include: {
    parent: true;
    children: true;
    _count: {
      select: { products: true };
    };
  };
}>;

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
    supplier: true;
    product_variants: {
      include: {
        inventory: true;
      };
    };
    product_images: true;
    reviews: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
            image: true;
          };
        };
      };
      orderBy: {
        created_at: "desc";
      };
    };
  };
}>;

export type OrderWithRelations = Prisma.OrdersGetPayload<{
  include: {
    order_items: true;
    payments: true;
    shipments: true;
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
                reviews: {
                  select: {
                    id: true;
                    user_id: true;
                    rating: true;
                    body: true;
                    created_at: true;
                  };
                };
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

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    segment: {
      select: {
        id: true;
        name: true;
        slug: true;
        color: true;
        icon: true;
        discount_percent: true;
      };
    };
    orders: {
      include: {
        payments: true;
        shipments: true;
        order_items: true;
        returns: true;
      };
    };
    addresses: true;
  };
}>;

export type CustomerSegment = Prisma.CustomerSegmentGetPayload<{
  include: {
    _count: {
      select: { users: true };
    };
  };
}>;

export type SegmentStats = {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  customerCount: number;
  totalSpent: number;
  discountPercent: number;
};

// Inventory Types
export type InventoryWithRelations = Prisma.InventoryGetPayload<{
  include: {
    variant: {
      include: {
        product: {
          include: {
            product_images: true;
            supplier: true;
          };
        };
      };
    };
  };
}>;

export type InventoryStats = {
  totalSku: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
};

export type StockMovement = {
  id: number;
  variant_id: string;
  action: string;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string | null;
  created_at: Date;
  user_id: string | null;
  user_name?: string;
};

// Supplier Types
export type Supplier = Prisma.SuppliersGetPayload<{
  include: {
    _count: {
      select: { products: true };
    };
  };
}>;

export type SupplierWithDetails = Prisma.SuppliersGetPayload<{
  include: {
    products: true;
  };
}>;

export type Coupon = Prisma.CouponsGetPayload<{
  include: {
    segment_coupons: {
      include: {
        segment: true;
      };
    };
  };
}> & {
  _count?: {
    orders: number;
  };
};
