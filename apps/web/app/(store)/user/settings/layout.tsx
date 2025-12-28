"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Bell, ChevronRight, Lock, MapPin, Package, User } from "lucide-react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

const menuItems = [
  { href: "/user/settings/profile", label: "Biodata Diri", icon: User },
  { href: "/user/settings/addresses", label: "Daftar Alamat", icon: MapPin },
  { href: "/user/settings/orders", label: "Pesanan Saya", icon: Package },
  { href: "/user/settings/notifications", label: "Notifikasi", icon: Bell },
  { href: "/user/settings/security", label: "Keamanan Akun", icon: Lock },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession();
  const pathname = usePathname();
  const isRoot = pathname === "/user/settings";
  const isLoading = isPending;

  if (!isLoading && !data?.user) {
    return redirect("/login");
  }

  const isActive = (href: string) =>
    pathname === href ||
    (pathname === "/user/settings" && href.endsWith("/profile"));

  const renderUserCard = () => (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-secondary border-2 border-border flex items-center justify-center text-3xl font-bold mb-3">
          <Avatar className="size-full">
            <AvatarImage
              src={data?.user.image ?? ""}
              alt={data?.user.name || "User avatar"}
            />
            <AvatarFallback>{data?.user.name?.charAt(0) ?? "U"}</AvatarFallback>
          </Avatar>
        </div>
        <h3 className="font-bold text-lg">{data?.user.name}</h3>
        <p className="text-sm text-muted-foreground">{data?.user.email}</p>
      </div>
    </div>
  );

  const renderUserCardSkeleton = () => (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col items-center text-center gap-3">
        <Skeleton className="w-20 h-20 rounded-full" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );

  const renderMenuSkeleton = (withTitle?: boolean) => (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {withTitle && (
        <div className="p-4 border-b border-border">
          <Skeleton className="h-5 w-32" />
        </div>
      )}
      <div className="divide-y divide-border">
        {Array.from({ length: 4 }).map((_, idx) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <div key={idx} className="p-4 flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-7xl lg:px-8 py-8">
        {/* Mobile View */}
        <div className="md:hidden">
          {isLoading ? (
            <div className="space-y-6">
              {renderUserCardSkeleton()}
              {isRoot ? (
                renderMenuSkeleton(true)
              ) : (
                <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-52" />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <div className="flex max-sm:flex-col max-sm:text-center items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-secondary border-2 border-border flex items-center justify-center text-2xl font-bold">
                    <Avatar className="size-full">
                      <AvatarImage
                        src={data?.user.image ?? ""}
                        alt={data?.user.name || "User avatar"}
                      />
                      <AvatarFallback>
                        {data?.user.name?.charAt(0) ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{data?.user.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {data?.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {!isRoot && (
                <div className="bg-card border border-border rounded-lg p-6">
                  {children}
                </div>
              )}

              {isRoot && (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <h3 className="font-bold text-lg p-4 border-b border-border">
                    Pilih Pengaturan
                  </h3>
                  <div className="divide-y divide-border">
                    {menuItems.map((item) => {
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`w-full flex items-center justify-between p-4 transition-colors`}
                        >
                          <span className="flex items-center gap-3 font-medium">
                            <item.icon className="h-5 w-5 text-muted-foreground" />
                            {item.label}
                          </span>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex gap-8">
          {isLoading ? (
            <>
              <div className="w-64 flex-shrink-0 space-y-6">
                {renderUserCardSkeleton()}
                {renderMenuSkeleton()}
              </div>
              <div className="flex-1 bg-card border border-border rounded-lg p-8 space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </>
          ) : (
            <>
              <div className="w-64 flex-shrink-0 space-y-6">
                {renderUserCard()}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="divide-y divide-border">
                    {menuItems.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                            active
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-muted"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-card border border-border rounded-lg p-8">
                {children}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
