import type { Metadata } from "next";
import localFont from "next/font/local";
import type React from "react";
import "@repo/ui/admin.css";
import "@repo/ui/globals.css";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar";
import { Toaster } from "@repo/ui/components/sonner";
import { ReactQueryProvider } from "@/components/react-query";
import { AdminSidebar } from "@/features/admin/components/app-sidebar";
import { TopNav } from "@/features/admin/components/top-nav";

export const metadata: Metadata = {
  title: "TryWear Admin Dashboard",
  description: "Admin dashboard for TryWear e-commerce platform",
};

const geistSans = localFont({
  src: "../../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} overflow-hidden`}
      >
        <ReactQueryProvider>
          <div className="flex h-screen bg-background">
            <SidebarProvider>
              <AdminSidebar />
              <SidebarInset className="min-w-0">
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                  <TopNav />
                  <div className="flex-1 overflow-auto min-w-0">{children}</div>
                </div>
              </SidebarInset>
            </SidebarProvider>
          </div>
        </ReactQueryProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
