import type { ShipmentStatusType } from "@repo/schema";
import type { ShippingMethod } from "@/types/index";

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 1,
    name: "JNE REG",
    description: "Regular Service",
    basePrice: 9000,
    estimatedDays: 2,
    regionModifier: {
      JABODETABEK: 0,
      JAWA: 2000,
      LUAR_JAWA: 6000,
    },
  },
  {
    id: 2,
    name: "JNE YES",
    description: "Yakin Esok Sampai",
    basePrice: 15000,
    estimatedDays: 1,
    regionModifier: {
      JABODETABEK: 0,
      JAWA: 3000,
      LUAR_JAWA: 8000,
    },
  },
  {
    id: 3,
    name: "JNE OKE",
    description: "Ongkos Kirim Ekonomis",
    basePrice: 7000,
    estimatedDays: 5,
    regionModifier: {
      JABODETABEK: 0,
      JAWA: 1500,
      LUAR_JAWA: 5000,
    },
  },
];

export const statusColors: Record<ShipmentStatusType, string> = {
  ready: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  in_transit: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
  returned: "bg-orange-100 text-orange-800",
  cancelled: "bg-rose-100 text-rose-800",
};

export const paymentStatusColors = {
  settlement: "bg-emerald-100 text-emerald-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-rose-100 text-rose-800",
};
