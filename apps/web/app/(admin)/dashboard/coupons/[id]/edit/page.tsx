"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import { useParams } from "next/navigation";
import { CouponForm } from "@/features/admin/components/coupons/coupon-form";
import { useCoupon } from "@/features/admin/queries/useCouponQuery";

export default function EditCouponPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: coupon, isPending, isError } = useCoupon(id);

  if (isPending) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !coupon) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Kupon tidak ditemukan.
      </div>
    );
  }

  return <CouponForm initialData={coupon} />;
}
