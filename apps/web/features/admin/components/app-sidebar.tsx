"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui/components/sidebar";
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
import type * as React from "react";
import { NavMain } from "@/features/admin/components/nav-main";
import { NavUser } from "@/features/admin/components/nav-user";
import { TeamSwitcher } from "@/features/admin/components/team-switcher";

const data = {
  user: {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "MonoWear",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "MonoWear",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "MonoWear",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Products",
      icon: Box,
      url: "#",
      items: [
        { title: "All Products", url: "/products" },
        { title: "Add Product", url: "/products/new" },
        // { title: "Variants", url: "/products/variants" },
        // { title: "Collections", url: "/products/collections" },
        // { title: "Archived", url: "/products/archived" },
      ],
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      url: "#",
      items: [
        { title: "All Orders", url: "/orders" },
        { title: "Pending", url: "/orders/pending" },
        { title: "Processing", url: "/orders/processing" },
        { title: "Shipped", url: "/orders/shipped" },
        { title: "Completed", url: "/orders/completed" },
        { title: "Cancelled", url: "/orders/cancelled" },
      ],
    },
    {
      title: "Customers",
      icon: Users,
      url: "#",
      items: [
        { title: "All Customers", url: "/customers" },
        { title: "Segments", url: "/customers/segments" },
        { title: "Loyalty Program", url: "/customers/loyalty" },
        { title: "Blacklist", url: "/customers/blacklist" },
      ],
    },
    {
      title: "Inventory",
      icon: Package,
      url: "#",
      items: [
        { title: "Stock Overview", url: "/inventory" },
        { title: "Stock Movements", url: "/inventory/movements" },
        { title: "Warehouses", url: "/inventory/warehouses" },
        { title: "Adjustments", url: "/inventory/adjustments" },
      ],
    },
    {
      title: "Suppliers",
      icon: Tag,
      url: "#",
      items: [
        { title: "All Suppliers", url: "/suppliers" },
        { title: "Purchase Orders", url: "/suppliers/orders" },
        { title: "Payments", url: "/suppliers/payments" },
      ],
    },
    {
      title: "Categories",
      icon: Grid,
      url: "#",
      items: [
        { title: "All Categories", url: "/categories" },
        { title: "Subcategories", url: "/categories/sub" },
        { title: "Attributes", url: "/categories/attributes" },
      ],
    },
    {
      title: "Coupons",
      icon: Percent,
      url: "#",
      items: [
        { title: "All Coupons", url: "/coupons" },
        { title: "Create Coupon", url: "/coupons/new" },
        { title: "Expired", url: "/coupons/expired" },
      ],
    },
    {
      title: "Returns",
      icon: RotateCcw,
      url: "#",
      items: [
        { title: "Return Requests", url: "/returns/requests" },
        { title: "Approved", url: "/returns/approved" },
        { title: "Rejected", url: "/returns/rejected" },
      ],
    },
    {
      title: "Reviews",
      icon: Star,
      url: "#",
      items: [
        { title: "All Reviews", url: "/reviews" },
        { title: "Pending Approval", url: "/reviews/pending" },
        { title: "Reported", url: "/reviews/reported" },
      ],
    },
    {
      title: "Analytics",
      icon: BarChart,
      url: "#",
      items: [
        { title: "Sales Overview", url: "/analytics/sales" },
        { title: "Customer Insights", url: "/analytics/customers" },
        { title: "Product Performance", url: "/analytics/products" },
      ],
    },
    {
      title: "Reports",
      icon: LineChart,
      url: "#",
      items: [
        { title: "Daily Reports", url: "/reports/daily" },
        { title: "Monthly Reports", url: "/reports/monthly" },
        { title: "Custom Report", url: "/reports/custom" },
      ],
    },
    {
      title: "Audit Logs",
      icon: ClipboardList,
      url: "#",
      items: [
        { title: "All Logs", url: "/audit" },
        { title: "User Activity", url: "/audit/users" },
        { title: "System Events", url: "/audit/system" },
      ],
    },
    {
      title: "Settings",
      icon: Settings,
      url: "#",
      items: [
        { title: "General", url: "/settings/general" },
        { title: "Payment", url: "/settings/payment" },
        { title: "Shipping", url: "/settings/shipping" },
        { title: "Email Templates", url: "/settings/email" },
        { title: "Roles & Permissions", url: "/settings/roles" },
      ],
    },
  ],
};

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
