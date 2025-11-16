"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { ChevronRight, Lock, MapPin, Package, User } from "lucide-react";
import { useEffect, useState } from "react";
import { AddressSection } from "@/features/user/components/settings/address/address-section";
import { OrdersSection } from "@/features/user/components/settings/orders/orders-section";
import { ProfileSection } from "@/features/user/components/settings/profile-section";
import { SecuritySection } from "@/features/user/components/settings/security-section";
import { authClient } from "@/lib/auth-client";

export default function SettingsPage() {
  const { data } = authClient.useSession();
  const [hash, setHash] = useState<string>("");

  // Function ambil hash saat ini
  const getHash = () =>
    typeof window !== "undefined"
      ? window.location.hash || "#profile"
      : "#profile";

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const handleHashChange = () => setHash(getHash());

    // initial
    handleHashChange();

    // listener setiap ada perubahan # di URL
    window.addEventListener("hashchange", handleHashChange);

    // cleanup listener
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const menuItems = [
    { id: "#profile", label: "Biodata Diri", icon: User },
    { id: "#addresses", label: "Daftar Alamat", icon: MapPin },
    { id: "#orders", label: "Pesanan Saya", icon: Package },
    { id: "#security", label: "Keamanan Akun", icon: Lock },
  ];

  const handleMenuClick = (id: string) => {
    window.location.hash = id;
    window.scrollTo(0, 0);
  };

  const renderSection = () => {
    switch (hash) {
      case "#addresses":
        return <AddressSection />;
      case "#orders":
        return <OrdersSection />;
      case "#security":
        return <SecuritySection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <main className="container mx-auto px-4 max-w-7xl lg:px-8 py-8">
      {/* Mobile View - List Navigation */}
      <div className="md:hidden">
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex max-sm:flex-col max-sm:text-center items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-secondary border-2 border-border flex items-center justify-center text-2xl font-bold">
              <Avatar className="size-full">
                <AvatarImage
                  src={data?.user.image ?? ""}
                  alt={data?.user.name || "User avatar"}
                />
                <AvatarFallback>{data?.user.name.charAt(0)}</AvatarFallback>
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

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <h3 className="font-bold text-lg p-4 border-b border-border">
            Pengaturan Akun
          </h3>
          <div className="divide-y divide-border">
            {menuItems.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {hash !== "profile" && (
          <div className="mt-6 bg-card border border-border rounded-lg p-6">
            {renderSection()}
          </div>
        )}
      </div>

      {/* Desktop View - Sidebar Layout */}
      <div className="hidden md:flex gap-8">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 space-y-6">
          {/* User Profile Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-secondary border-2 border-border flex items-center justify-center text-3xl font-bold mb-3">
                <Avatar className="size-full">
                  <AvatarImage
                    src={data?.user.image ?? ""}
                    alt={data?.user.name || "User avatar"}
                  />
                  <AvatarFallback>{data?.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <h3 className="font-bold text-lg">{data?.user.name}</h3>
              <p className="text-sm text-muted-foreground">
                {data?.user.email}
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="divide-y divide-border">
              {menuItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                    hash === item.id
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-card border border-border rounded-lg p-8">
          {renderSection()}
        </div>
      </div>
    </main>
  );
}
