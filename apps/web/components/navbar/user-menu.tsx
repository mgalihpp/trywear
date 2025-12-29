"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { cn } from "@repo/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Heart, LayoutDashboard, LogOut, Package, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

interface UserMenuProps {
  isTransparent?: boolean;
}

export const UserMenu = ({ isTransparent }: UserMenuProps) => {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const { data: segments } = useQuery({
    queryKey: ["segments"],
    queryFn: () => api.segment.getAll(),
    enabled: !!session?.user,
  });

  const user = session?.user;
  const userSegment = segments?.find((s) => s.id === (user as any)?.segment_id);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  if (!user) {
    return (
      <Link href="/login">
        <div
          className={cn(
            "p-2 rounded-full transition-colors",
            isTransparent
              ? "text-white hover:bg-white/20"
              : "text-foreground hover:bg-accent",
          )}
        >
          <User className="h-5 w-5" />
        </div>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="relative outline-none group">
          <Avatar
            className={cn(
              "h-9 w-9 border-2 transition-all",
              isTransparent ? "border-white/20" : "border-border",
              "group-hover:border-primary",
            )}
          >
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          {/* Segment Indicator Badge */}
          {userSegment && (
            <div
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-background"
              style={{ backgroundColor: userSegment.color ?? "#6b7280" }}
              title={userSegment.name}
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground italic">
              {user.email}
            </p>
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
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/user/settings" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profil Saya</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/user/settings/orders" className="cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            <span>Pesanan Saya</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/wishlist" className="cursor-pointer">
            <Heart className="mr-2 h-4 w-4" />
            <span>Wishlist</span>
          </Link>
        </DropdownMenuItem>

        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="text-destructive mr-2 h-4 w-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
