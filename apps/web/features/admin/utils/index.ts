import type { VariantCombination } from "@/types/index";

export const getStockStatus = (combo: VariantCombination) => {
  const { stock_quantity, reserved_quantity, safety_stock } = combo;

  // Hitung stok aktual yang tersedia
  const availableStock = Math.max(stock_quantity - reserved_quantity, 0);

  // Buat ambang batas yang jelas
  const criticalThreshold = safety_stock * 0.5; // di bawah 50% dari stok aman = kritis
  const lowThreshold = safety_stock; // di bawah stok aman = low

  if (availableStock <= 0) {
    return { status: "out", color: "secondary", label: "Out of Stock" };
  }

  if (availableStock <= criticalThreshold) {
    return {
      status: "critical",
      color: "destructive",
      label: "Critical Stock",
    };
  }

  if (availableStock <= lowThreshold) {
    return { status: "low", color: "warning", label: "Low Stock" };
  }

  return { status: "good", color: "success", label: "In Stock" };
};

export const getStockPercentage = (combo: VariantCombination) => {
  const { stock_quantity, reserved_quantity, safety_stock } = combo;

  const available = Math.max(stock_quantity - reserved_quantity, 0);

  // Target optimal adalah safety_stock * 2 (stok aman dikali 2)
  const optimal = Math.max(safety_stock * 2, 1); // hindari divide by zero

  // Persentase stok terhadap target optimal
  const percentage = (available / optimal) * 100;

  // Pastikan dalam range 0–100
  return Math.min(Math.max(percentage, 0), 100);
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (input?: string | Date | null): string => {
  if (!input) return "";
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "";
  return date
    .toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
      timeZoneName: "short",
    })
    .replace("pukul ", "");
};

export const isNotFoundError = (error: any): boolean => {
  if (!error) return false;

  // Check for specific error code
  if (error?.response?.data?.errorCode === "RESOURCE_NOT_FOUND") {
    return true;
  }

  // Check for 404 status
  if (error?.response?.status === 404) {
    return true;
  }

  return false;
};
