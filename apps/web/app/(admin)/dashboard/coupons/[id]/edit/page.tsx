"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import { useParams } from "next/navigation";
import { CouponForm } from "@/features/admin/components/coupons/coupon-form";
import { ErrorAlert } from "@/features/admin/components/error-alert";
import { NotFoundAlert } from "@/features/admin/components/not-found-alert";
import { useCoupon } from "@/features/admin/queries/useCouponQuery";
import { isNotFoundError } from "@/features/admin/utils";

export default function EditCouponPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: coupon, isPending, isError, error } = useCoupon(id);

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

  if (isError) {
    if (isNotFoundError(error)) {
      return (
        <NotFoundAlert
          title="Kupon Tidak Ditemukan"
          description="Kupon yang Anda cari tidak dapat ditemukan."
          backUrl="/dashboard/coupons"
        />
      );
    }

    return (
      <div className="p-8">
        <ErrorAlert
          description="Gagal memuat detail kupon."
          action={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!coupon) {
    return (
      <NotFoundAlert
        title="Kupon Tidak Ditemukan"
        description="Kupon yang Anda cari tidak dapat ditemukan."
        backUrl="/dashboard/coupons"
      />
    );
  }

  return <CouponForm initialData={coupon} />;
}
