"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { cn } from "@repo/ui/lib/utils";
import { Heart, Home, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Cari",
    href: "/products",
    icon: Search,
  },
  {
    label: "Keranjang",
    href: "/cart",
    icon: ShoppingBag,
  },
  {
    label: "Wishlist",
    href: "/wishlist",
    icon: Heart,
  },
  {
    label: "Akun",
    href: "/user/settings",
    icon: User,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-safe">
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-xl border-t border-border" />

      {/* Navigation items */}
      <div className="relative flex items-center justify-between h-16 px-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-2 min-w-[56px]",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.label === "Akun" && user ? (
                <Avatar
                  className={cn(
                    "w-5 h-5 border",
                    isActive ? "border-primary" : "border-muted-foreground",
                  )}
                >
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <item.icon
                  className={cn("w-5 h-5", isActive && "text-primary")}
                />
              )}

              {/* Label */}
              <span
                className={cn(
                  "text-[10px]",
                  isActive ? "font-semibold" : "font-medium",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
