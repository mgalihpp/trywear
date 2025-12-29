import {
  AudioWaveform,
  BarChart,
  Box,
  ClipboardList,
  Command,
  GalleryVerticalEnd,
  Grid,
  LineChart,
  Package,
  Percent,
  RotateCcw,
  Settings,
  ShoppingCart,
  Star,
  Tag,
  Users,
} from "lucide-react";

export const ADMIN_NAV_DATA = {
  teams: [
    {
      name: "TryWear",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "TryWear",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "TryWear",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Produk",
      icon: Box,
      url: "#",
      items: [
        { title: "Semua Produk", url: "/products" },
        { title: "Tambah Produk", url: "/products/new" },
      ],
    },
    {
      title: "Pesanan",
      icon: ShoppingCart,
      url: "#",
      items: [
        { title: "Semua Pesanan", url: "/orders" },
        { title: "Menunggu", url: "/orders/pending" },
        { title: "Diproses", url: "/orders/processing" },
        { title: "Dikirim", url: "/orders/shipped" },
        { title: "Selesai", url: "/orders/completed" },
        { title: "Dibatalkan", url: "/orders/cancelled" },
      ],
    },
    {
      title: "Pelanggan",
      icon: Users,
      url: "#",
      items: [
        { title: "Semua Pelanggan", url: "/customers" },
        { title: "Segmen", url: "/customers/segments" },
      ],
    },
    {
      title: "Inventaris",
      icon: Package,
      url: "#",
      items: [
        { title: "Ringkasan Stok", url: "/inventory" },
        { title: "Pergerakan Stok", url: "/inventory/movements" },
      ],
    },
    {
      title: "Pemasok",
      icon: Tag,
      url: "#",
      items: [{ title: "Semua Pemasok", url: "/suppliers" }],
    },
    {
      title: "Kategori",
      icon: Grid,
      url: "#",
      items: [{ title: "Semua Kategori", url: "/categories" }],
    },
    {
      title: "Kupon",
      icon: Percent,
      url: "#",
      items: [
        { title: "Semua Kupon", url: "/coupons" },
        { title: "Buat Kupon", url: "/coupons/new" },
      ],
    },
    {
      title: "Pengembalian",
      icon: RotateCcw,
      url: "#",
      items: [
        { title: "Semua Pengembalian", url: "/returns" },
      ],
    },
    {
      title: "Ulasan",
      icon: Star,
      url: "#",
      items: [
        { title: "Semua Ulasan", url: "/reviews" },
        { title: "Menunggu Persetujuan", url: "/reviews/pending" },
        { title: "Dilaporkan", url: "/reviews/reported" },
      ],
    },
    {
      title: "Analitik",
      icon: BarChart,
      url: "#",
      items: [
        { title: "Ringkasan Penjualan", url: "/analytics/sales" },
        { title: "Wawasan Pelanggan", url: "/analytics/customers" },
        { title: "Performa Produk", url: "/analytics/products" },
      ],
    },
    {
      title: "Laporan",
      icon: LineChart,
      url: "#",
      items: [
        { title: "Laporan Harian", url: "/reports/daily" },
        { title: "Laporan Bulanan", url: "/reports/monthly" },
        { title: "Laporan Kustom", url: "/reports/custom" },
      ],
    },
    {
      title: "Log Audit",
      icon: ClipboardList,
      url: "#",
      items: [
        { title: "Semua Log", url: "/audit" },
        { title: "Aktivitas Pengguna", url: "/audit/users" },
        { title: "Event Sistem", url: "/audit/system" },
      ],
    },
    {
      title: "Pengaturan",
      icon: Settings,
      url: "#",
      items: [
        { title: "Umum", url: "/settings/general" },
        { title: "Pembayaran", url: "/settings/payment" },
        { title: "Pengiriman", url: "/settings/shipping" },
        { title: "Template Email", url: "/settings/email" },
        { title: "Peran & Izin", url: "/settings/roles" },
      ],
    },
  ],
};
