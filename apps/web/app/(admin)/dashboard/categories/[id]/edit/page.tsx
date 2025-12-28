"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import { useParams } from "next/navigation";
import { CategoryForm } from "@/features/admin/components/categories/category-form";
import { useCategory } from "@/features/admin/queries/useCategoryQuery";

export default function EditCategoryPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: category, isPending, isError } = useCategory(id);

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

  if (isError || !category) {
    return (
      <div className="p-4 md:p-8 text-center bg-muted/20 rounded-lg m-8">
        <h2 className="text-xl font-bold">Kategori tidak ditemukan</h2>
        <p className="text-muted-foreground mt-2">
          Pastikan ID kategori benar atau sudah tersinkronisasi.
        </p>
      </div>
    );
  }

  return <CategoryForm initialData={category} />;
}
