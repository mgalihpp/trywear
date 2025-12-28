"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import { useQuery } from "@tanstack/react-query";
import {
  Baby,
  Heart,
  Home,
  LogOut,
  Menu,
  Package,
  Percent,
  Settings,
  ShirtIcon,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

const categories = [
  { label: "Pria", href: "/products?category=pria", icon: ShirtIcon },
  { label: "Wanita", href: "/products?category=wanita", icon: Sparkles },
  { label: "Anak", href: "/products?category=anak", icon: Baby },
  { label: "Promo", href: "/products?sale=true", icon: Percent },
];

const quickLinks = [
  { label: "Beranda", href: "/", icon: Home },
  { label: "Semua Produk", href: "/products", icon: ShoppingBag },
  { label: "Wishlist Saya", href: "/wishlist", icon: Heart },
  { label: "Pesanan Saya", href: "/user/settings", icon: Package },
];

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const { data: segments } = useQuery({
    queryKey: ["segments"],
    queryFn: () => api.segment.getAll(),
    enabled: !!user,
  });

  const userSegment = segments?.find((s) => s.id === (user as any)?.segment_id);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setOpen(false);
        },
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        hideClose
        className="w-full max-w-sm p-0 border-0"
      >
        <SheetHeader className="hidden">
          <SheetTitle></SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2"
            >
              <img
                src={"/logo-dark.png"}
                alt="TryWear"
                className="h-20 w-auto"
              />
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Categories Section */}
            <div className="p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Kategori
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-primary/30 transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <Separator />

            {/* Quick Links */}
            <div className="p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Menu
              </h3>
              <nav className="space-y-1">
                {quickLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors group"
                  >
                    <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Footer / Auth */}
          <div className="p-4 border-t border-border space-y-3">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base truncate">{user.name}</p>
                    {userSegment && (
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${userSegment.color}10`,
                          color: userSegment.color ?? undefined,
                          borderColor: `${userSegment.color}40`,
                          fontWeight: 600,
                        }}
                      >
                        {userSegment.name} Member
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    className="h-10 text-sm"
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/user/settings">
                      <Settings /> Pengaturan
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-10 text-sm text-destructive hover:text-destructive hover:bg-destructive/5"
                    onClick={handleLogout}
                  >
                    <LogOut />
                    Keluar
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full h-12 font-semibold"
                onClick={() => setOpen(false)}
                asChild
              >
                <Link href="/login">
                  <User className="mr-2 h-5 w-5" />
                  Masuk / Daftar
                </Link>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
