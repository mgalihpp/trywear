"use client";

import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CartSheet from "@/features/cart/components/cart-sheet";
import { NotificationBell } from "@/features/user/components/settings/notification/notification-bell";
import MobileMenu from "./mobile-menu";

const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Belanja", href: "/products" },
  { label: "Terbaru", href: "/products?sort=newest" },
  { label: "Promo", href: "/products?sale=true" },
];

export const Header = () => {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Only use transparent header on landing page when not scrolled
  const isTransparent = isLandingPage && !isScrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isTransparent
          ? "bg-transparent"
          : "bg-background/95 backdrop-blur-md border-b border-border shadow-sm",
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left - Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
            <MobileMenu />
            <Link href="/" className="flex items-center gap-2">
              <img
                src={isTransparent ? "/logo.png" : "/logo-dark.png"}
                alt="TryWear"
                className="h-20 w-auto"
              />
            </Link>
          </div>

          {/* Center - Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isTransparent
                    ? "text-white/90 hover:text-white"
                    : "text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right - Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "",
                isTransparent
                  ? "text-white hover:text-white hover:bg-white/20"
                  : "hover:bg-accent",
              )}
              asChild
            >
              <Link href="/products">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hidden sm:flex",
                isTransparent
                  ? "text-white hover:text-white hover:bg-white/20"
                  : "hover:bg-accent",
              )}
              asChild
            >
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            <div
              className={cn(
                isTransparent
                  ? "[&_button]:text-white [&_button]:hover:text-white [&_button]:hover:bg-white/20"
                  : "",
              )}
            >
              <NotificationBell />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hidden sm:flex",
                isTransparent
                  ? "text-white hover:text-white hover:bg-white/20"
                  : "hover:bg-accent",
              )}
              asChild
            >
              <Link href="/user/settings">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <div
              className={cn(
                isTransparent
                  ? "[&_button]:text-white [&_button]:hover:text-white [&_button]:hover:bg-white/20"
                  : "",
              )}
            >
              <CartSheet />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
