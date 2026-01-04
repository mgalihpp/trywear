"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import { useParams } from "next/navigation";
import { CategoryForm } from "@/features/admin/components/categories/category-form";
import { ErrorAlert } from "@/features/admin/components/error-alert";
import { NotFoundAlert } from "@/features/admin/components/not-found-alert";
import { useCategory } from "@/features/admin/queries/useCategoryQuery";
import { isNotFoundError } from "@/features/admin/utils";

export default function EditCategoryPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: category, isPending, isError, error } = useCategory(id);

  if (isPending) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full max-w-xl" />
          <Skeleton className="h-12 w-full max-w-xl" />
          <Skeleton className="h-32 w-full max-w-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    if (isNotFoundError(error)) {
      return (
        <NotFoundAlert
          title="Kategori tidak ditemukan"
          description="Kategori yang Anda cari tidak dapat ditemukan atau telah dihapus."
          backUrl="/dashboard/categories"
        />
      );
    }

    return (
      <div className="p-8">
        <ErrorAlert
          description="Gagal memuat kategori."
          action={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!category) {
    return (
      <NotFoundAlert
        title="Kategori tidak ditemukan"
        description="Kategori yang Anda cari tidak dapat ditemukan atau telah dihapus."
        backUrl="/dashboard/categories"
      />
    );
  }

  return <CategoryForm initialData={category} />;
}
