"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  // --- DASHBOARD
  "/dashboard": [{ label: "Dashboard" }],

  // --- 1. PRODUCTS
  "/dashboard/products": [{ label: "Produk" }],
  "/dashboard/products/new": [
    { label: "Produk", href: "/products" },
    { label: "Add Product" },
  ],
  "/dashboard/products/edit": [
    { label: "Produk", href: "/products" },
    { label: "Add Product" },
  ],
  "/dashboard/products/variants": [
    { label: "Produk", href: "/products" },
    { label: "Varian" },
  ],
  "/dashboard/products/collections": [
    { label: "Produk", href: "/products" },
    { label: "Koleksi" },
  ],
  "/dashboard/products/archived": [
    { label: "Produk", href: "/products" },
    { label: "Arsip" },
  ],

  // --- 2. ORDERS
  "/dashboard/orders": [{ label: "Pesanan" }],
  "/dashboard/orders/pending": [
    { label: "Pesanan", href: "/orders" },
    { label: "Menunggu" },
  ],
  "/dashboard/orders/processing": [
    { label: "Pesanan", href: "/orders" },
    { label: "Diproses" },
  ],
  "/dashboard/orders/shipped": [
    { label: "Pesanan", href: "/orders" },
    { label: "Dikirim" },
  ],
  "/dashboard/orders/completed": [
    { label: "Pesanan", href: "/orders" },
    { label: "Selesai" },
  ],
  "/dashboard/orders/cancelled": [
    { label: "Pesanan", href: "/orders" },
    { label: "Dibatalkan" },
  ],

  // --- 3. CUSTOMERS
  "/dashboard/customers": [{ label: "Pelanggan" }],
  "/dashboard/customers/segments": [
    { label: "Pelanggan", href: "/customers" },
    { label: "Segments" },
  ],
  "/dashboard/customers/segments/new": [
    { label: "Pelanggan", href: "/customers" },
    { label: "Segments", href: "/customers/segments" },
    { label: "Tambah Segment" },
  ],

  // --- 4. INVENTORY
  "/dashboard/inventory": [{ label: "Stok" }], // Stock Overview
  "/dashboard/inventory/movements": [
    { label: "Stok", href: "/inventory" },
    { label: "Stock Movements" },
  ],

  // --- 5. SUPPLIERS
  "/dashboard/suppliers": [{ label: "Pemasok" }],
  "/dashboard/suppliers/new": [
    { label: "Pemasok", href: "/suppliers" },
    { label: "Tambah Supplier" }, // Mengikuti pola `/new`
  ],
  "/dashboard/suppliers/orders": [
    { label: "Pemasok", href: "/suppliers" },
    { label: "Pesanan" },
  ],
  "/dashboard/suppliers/payments": [
    { label: "Pemasok", href: "/suppliers" },
    { label: "Pembayaran" },
  ],

  // --- 6. CATEGORIES
  "/dashboard/categories": [{ label: "Kategori" }],
  "/dashboard/categories/new": [
    { label: "Kategori", href: "/categories" },
    { label: "Tambah Kategori" }, // Mengikuti pola `/new`
  ],
  "/dashboard/categories/sub": [
    { label: "Kategori", href: "/categories" },
    { label: "Sub Kategori" },
  ],
  "/dashboard/categories/attributes": [
    { label: "Kategori", href: "/categories" },
    { label: "Atribut" },
  ],

  // --- 7. COUPONS
  "/dashboard/coupons": [{ label: "Kupon" }],
  "/dashboard/coupons/new": [
    { label: "Kupon", href: "/coupons" },
    { label: "Tambah Kupon" },
  ],
  "/dashboard/coupons/expired": [
    { label: "Kupon", href: "/coupons" },
    { label: "Kupon Kadarluasa" },
  ],

  // --- 8. RETURNS
  "/dashboard/returns": [{ label: "Pengembalian" }],
  "/dashboard/returns/requests": [
    { label: "Pengembalian", href: "/returns" },
    { label: "Permintaan" },
  ],
  "/dashboard/returns/approved": [
    { label: "Pengembalian", href: "/returns" },
    { label: "Disetujui" },
  ],
  "/dashboard/returns/rejected": [
    { label: "Pengembalian", href: "/returns" },
    { label: "Ditolak" },
  ],

  // --- 9. REVIEWS
  "/dashboard/reviews": [{ label: "Ulasan" }],
  "/dashboard/reviews/pending": [
    { label: "Ulasan", href: "/reviews" },
    { label: "Menunggu Persetujuan" },
  ],
  "/dashboard/reviews/reported": [
    { label: "Ulasan", href: "/reviews" },
    { label: "Dilaporkan" },
  ],

  // --- 10. ANALYTICS
  "/dashboard/analytics": [{ label: "Analisis" }],
  "/dashboard/analytics/sales": [
    { label: "Analisis", href: "/analytics" },
    { label: "Overview Penjualan" },
  ],
  "/dashboard/analytics/customers": [
    { label: "Analisis", href: "/analytics" },
    { label: "Insight Pelanggan" },
  ],
  "/dashboard/analytics/products": [
    { label: "Analisis", href: "/analytics" },
    { label: "Performa Produk" },
  ],

  // --- 11. REPORTS
  "/dashboard/reports": [{ label: "Laporan" }],
  "/dashboard/reports/daily": [
    { label: "Laporan", href: "/reports" },
    { label: "Laporan Harian" },
  ],
  "/dashboard/reports/monthly": [
    { label: "Laporan", href: "/reports" },
    { label: "Laporan Bulanan" },
  ],
  "/dashboard/reports/custom": [
    { label: "Laporan", href: "/reports" },
    { label: "Laporan Kustom" },
  ],

  // --- 12. AUDIT LOGS
  "/dashboard/audit": [{ label: "Audit Log" }], // All Logs
  "/dashboard/audit/users": [
    { label: "Audit Log", href: "/audit" },
    { label: "Aktivitas User" },
  ],
  "/dashboard/audit/system": [
    { label: "Audit Log", href: "/audit" },
    { label: "Aktivitas Sistem" },
  ],

  // --- 13. SETTINGS
  "/dashboard/settings": [{ label: "Pengaturan" }], // General
  "/dashboard/settings/general": [
    { label: "Pengaturan", href: "/settings" },
    { label: "Umum" },
  ],
  "/dashboard/settings/payment": [
    { label: "Pengaturan", href: "/settings" },
    { label: "Pembayaran" },
  ],
  "/dashboard/settings/shipping": [
    { label: "Pengaturan", href: "/settings" },
    { label: "Pengiriman" },
  ],
  "/dashboard/settings/email": [
    { label: "Pengaturan", href: "/settings" },
    { label: "Template Email" },
  ],
  "/dashboard/settings/roles": [
    { label: "Pengaturan", href: "/settings" },
    { label: "Peran & Izin" },
  ],
};

export function Breadcrumb() {
  const pathname = usePathname();

  // Get breadcrumb items for current path
  let items = breadcrumbMap[pathname];

  // Handle dynamic routes like /products/[id], /orders/[id]/edit, etc.
  if (!items) {
    // --- 1. Products: Menangani /products/[id] dan /products/[id]/edit
    if (pathname.includes("/products/") && pathname.includes("/edit")) {
      items = [
        { label: "Produk", href: "/products" },
        { label: "Ubah Produk" },
      ];
    } else if (pathname.match(/^\/products\/[^/]+$/)) {
      // Contoh: /products/123
      items = [
        { label: "Produk", href: "/products" },
        { label: "Detail Produk" },
      ];
    }

    // --- 2. Orders: Menangani /orders/[id]
    else if (
      pathname.includes("/orders/") &&
      !pathname.includes("/new") &&
      !pathname.includes("/processing") &&
      !pathname.includes("/shipped") &&
      !pathname.includes("/completed") &&
      !pathname.includes("/cancelled")
    ) {
      items = [
        { label: "Pesanan", href: "/orders" },
        { label: "Detail Pesanan" },
      ];
    }

    // --- 3. Customers: Menangani /customers/[id] dan /customers/segments/[id]
    else if (
      pathname.includes("/customers/segments/") &&
      !pathname.includes("/new")
    ) {
      items = [
        { label: "Customers", href: "/customers" },
        { label: "Segments", href: "/customers/segments" },
        { label: "Ubah Segment" },
      ];
    } else if (
      pathname.includes("/customers/") &&
      !pathname.includes("/segments")
    ) {
      items = [
        { label: "Pelanggan", href: "/customers" },
        { label: "Detail Pelanggan" },
      ];
    }

    // --- 4. Inventory: Menangani /inventory/[id] (Jika ada detail item inventaris)
    else if (
      pathname.includes("/inventory/") &&
      !pathname.includes("/movements")
    ) {
      items = [
        { label: "Inventory", href: "/inventory" },
        { label: "Detail Stok Barang" }, // Lebih spesifik dari "Inventory Details"
      ];
    }

    // --- 5. Suppliers: Menangani /suppliers/[id]
    else if (
      pathname.includes("/suppliers/") &&
      !pathname.includes("/orders") &&
      !pathname.includes("/payments") &&
      !pathname.includes("/new")
    ) {
      items = [
        { label: "Pemasok", href: "/suppliers" },
        { label: "Detail Pemasok" },
      ];
    }

    // --- 6. Categories: Menangani /categories/[id]
    else if (
      pathname.includes("/categories/") &&
      !pathname.includes("/sub") &&
      !pathname.includes("/new")
    ) {
      items = [
        { label: "Kategori", href: "/categories" },
        { label: "Detail Kategori" },
      ];
    }

    // --- 7. Coupons: Menangani /coupons/[id]
    else if (
      pathname.includes("/coupons/") &&
      !pathname.includes("/new") &&
      !pathname.includes("/expired")
    ) {
      items = [
        { label: "Coupons", href: "/coupons" },
        { label: "Coupon Details" },
      ];
    }

    // --- 8. Returns: Menangani /returns/[id]
    else if (
      pathname.includes("/returns/") &&
      !pathname.includes("/requests") &&
      !pathname.includes("/approved") &&
      !pathname.includes("/rejected")
    ) {
      items = [
        { label: "Returns", href: "/returns" },
        { label: "Return Details" },
      ];
    }

    // Tambahan: /reviews/[id]
    else if (
      pathname.includes("/reviews/") &&
      !pathname.includes("/pending") &&
      !pathname.includes("/reported")
    ) {
      items = [
        { label: "Reviews", href: "/reviews" },
        { label: "Review Details" },
      ];
    }

    // Jika tidak ada yang cocok, gunakan Dashboard sebagai fallback
    else {
      items = [{ label: "Dashboard" }];
    }
  }

  return (
    <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-background/50">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          {item.href ? (
            <Link
              href={`/dashboard${item.href}`}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
