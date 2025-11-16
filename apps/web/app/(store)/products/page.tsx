"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@repo/ui/components/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Filter, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorAlert } from "@/features/admin/components/error-alert";
import { SORT_OPTIONS } from "@/features/product/constants";
import { ProductGrid } from "@/features/search/components/product-grid";
import { api } from "@/lib/api";
import type { FilterProps, SortType } from "@/types/index";
import FilterCategory from "./_components/category-filter";
import FilterColor from "./_components/color-filter";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "./_components/pagination";
import FilterPrice from "./_components/price-filter";
import FilterSize from "./_components/size-filter";

const DEFAULT_CUSTOM_PRICE = [0, 1000000] as [number, number];

export default function ProductsPage() {
  const router = useRouter();

  const pageParams = useSearchParams().get("page");
  const queryParams = useSearchParams().get("query");
  const categoryParams = useSearchParams().get("category");
  const sortParams = useSearchParams().get("sort") as SortType | null;
  const colorsParams = useSearchParams().getAll("colors[]");
  const sizesParams = useSearchParams().getAll("sizes[]");
  const priceMinParams = useSearchParams().get("price.range.0");
  const priceMaxParams = useSearchParams().get("price.range.1");
  const isCustomPriceParams = useSearchParams().get("price.isCustom");

  const [pages, setPages] = useState<number>(Number(pageParams ?? 1));
  const [filter, setFilter] = useState<FilterProps>({
    sort: sortParams ?? "none",
    category: Number(categoryParams) ?? null,
    colors: colorsParams ?? [],
    sizes: sizesParams ?? [],
    query: queryParams ?? "",
    price: {
      isCustom: isCustomPriceParams === "true",
      range: [
        priceMinParams ? Number(priceMinParams) : DEFAULT_CUSTOM_PRICE[0],
        priceMaxParams ? Number(priceMaxParams) : DEFAULT_CUSTOM_PRICE[1],
      ] as [number, number],
    },
    page: pages,
    pageSize: 12,
  });

  const {
    data: products,
    isPending: isProductsLoading,
    isError,
  } = useQuery({
    queryKey: ["products", filter],
    queryFn: () =>
      api.product.filter.getAll({
        categoryId: filter.category || undefined,
        colors: filter.colors.length > 0 ? filter.colors : undefined,
        sizes: filter.sizes.length > 0 ? filter.sizes : undefined,
        priceRange: [filter.price.range[0], filter.price.range[1]] as [
          number,
          number,
        ],
        query: filter.query || undefined,
        sort: filter.sort !== "none" ? filter.sort : undefined,
        page: filter.page,
        limit: filter.pageSize,
      }),
  });

  const { data: categories, isPending: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: api.category.getAll,
  });

  const { data, isPending: isFiltersLoading } = useQuery({
    queryKey: ["sizes"],
    queryFn: api.product.filter.getFilters,
  });

  const colors = data?.colors;
  const sizes = data?.sizes;

  const applyArrayFilter = ({
    category,
    value,
  }: {
    category: keyof Omit<
      typeof filter,
      "price" | "sort" | "category" | "page" | "pageSize" | "query"
    >;
    value: string;
  }) => {
    const isFiltereApplied = filter[category].includes(value as never);

    if (isFiltereApplied) {
      setFilter((prev) => ({
        ...prev,
        [category]: prev[category].filter((v) => v !== value),
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        [category]: [...prev[category], value],
      }));
    }
  };

  const minPrice = Math.min(filter.price.range[0], filter.price.range[1]);
  const maxPrice = Math.max(filter.price.range[0], filter.price.range[1]);

  // Function to generate search params string
  function generateSearchParams(filter: FilterProps): string {
    const params = new URLSearchParams();

    Object.entries(filter).forEach(([key, value]) => {
      if (value === null || value === undefined) return; // abaikan null/undefined

      if (Array.isArray(value)) {
        value.map((item) => params.append(`${key}[]`, item.toString()));
      } else if (typeof value === "object" && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (Array.isArray(subValue)) {
            // contoh: price.range -> price.range.0, price.range.1
            subValue.forEach((v, i) => {
              params.append(`${key}.${subKey}.${i}`, v.toString());
            });
          } else if (subValue !== null && subValue !== undefined) {
            params.append(`${key}.${subKey}`, subValue.toString());
          }
        });
      } else {
        params.set(key, value.toString());
      }
    });

    return params.toString();
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (categories && colors && sizes) {
      const searchParams = generateSearchParams(filter);
      router.push(`${window.location.pathname}?${searchParams}`, {
        scroll: false,
      });
    }
  }, [categories, colors, sizes, filter, router]);

  const isNextDisabled = products && products.length < 12;
  const isPrevDisabled = pages === 1;

  const handleNextPage = () => {
    const nextPage = pages + 1;
    const params = new URLSearchParams(window.location.search);
    params.set("page", nextPage.toString()); // Convert nextPage to string
    router.push(`${window.location.pathname}?${params.toString()}`);

    setFilter((prev) => ({
      ...prev,
      page: nextPage,
    }));
    setPages(nextPage);
  };

  const handlePreviousPage = () => {
    const prevPage = pages > 1 ? pages - 1 : 1; // Ensure prevPage is always greater than or equal to 1
    const params = new URLSearchParams(window.location.search);
    params.set("page", prevPage.toString()); // Convert prevPage to string
    router.push(`${window.location.pathname}?${params.toString()}`);

    setFilter((prev) => ({
      ...prev,
      page: prevPage,
    }));
    setPages(prevPage);
  };

  const resetFilter = () =>
    setFilter(() => ({
      sort: "none",
      category: null,
      colors: [],
      sizes: [],
      query: "",
      price: {
        isCustom: false,
        range: DEFAULT_CUSTOM_PRICE,
      },
      page: 1,
      pageSize: 12,
    }));

  return (
    <main className="min-h-screen container max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ==== SIDEBAR FILTER (FULL LEFT DESKTOP) ==== */}
        <aside className="hidden lg:block lg:col-span-1 lg:sticky lg:top-20 self-start h-fit">
          <Card>
            <CardContent className="pt-6">
              {/* Search Input */}
              <div className="flex w-full items-center gap-3 border border-gray-200 rounded-md px-2 py-1">
                <Input
                  className="border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Search products..."
                  value={filter.query}
                  onChange={(e) =>
                    setFilter((prev: any) => ({
                      ...prev,
                      query: e.target.value,
                    }))
                  }
                />
                <button type="button" disabled={filter.query === ""}>
                  <Search className="size-4 cursor-pointer hover:text-blue-500" />
                </button>
              </div>

              <Separator className="my-6" />

              {/* Filters */}
              <FilterCategory
                setFilter={setFilter}
                filter={filter}
                isLoading={isCategoriesLoading}
                categories={categories!}
              />
              <FilterColor
                applyArrayFilter={applyArrayFilter}
                filter={filter}
                isLoading={isFiltersLoading}
                colors={colors}
              />
              <FilterSize
                applyArrayFilter={applyArrayFilter}
                filter={filter}
                isLoading={isFiltersLoading}
                sizes={sizes}
              />
              <FilterPrice
                setFilter={setFilter}
                filter={filter}
                minPrice={minPrice}
                maxPrice={maxPrice}
                defaultPrice={DEFAULT_CUSTOM_PRICE}
              />

              <Button
                variant="transparent"
                className="mt-4 p-0 hover:opacity-75"
                onClick={resetFilter}
              >
                Reset Filter
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* ==== MAIN CONTENT (RIGHT SIDE) ==== */}
        <section className="lg:col-span-3 flex flex-col">
          {/* ===== HEADER (Breadcrumb + Sort + Filter Mobile) ===== */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Products</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 border px-3 py-1 rounded-md hover:bg-gray-50 text-sm font-medium">
                  Sort
                  <ChevronDown className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="p-0">
                  {SORT_OPTIONS.map((option: any) => (
                    <button
                      key={option.name}
                      type="button"
                      className={cn(
                        "block w-full px-4 py-2 text-left text-sm hover:bg-gray-100",
                        option.value === filter.sort
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-500",
                      )}
                      onClick={() =>
                        setFilter((prev: any) => ({
                          ...prev,
                          sort: option.value,
                        }))
                      }
                    >
                      {option.name}
                    </button>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* MOBILE FILTER */}
              <Sheet>
                <SheetTrigger>
                  <Filter className="size-4 cursor-pointer lg:hidden" />
                </SheetTrigger>
                <SheetContent className="overflow-auto">
                  <SheetHeader>
                    <SheetTitle>Filter Produk</SheetTitle>
                    <SheetDescription>
                      Gunakan opsi di bawah ini untuk menyesuaikan produk Anda.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="px-4">
                    <FilterCategory
                      setFilter={setFilter}
                      filter={filter}
                      isLoading={isCategoriesLoading}
                      categories={categories!}
                    />
                    <FilterColor
                      applyArrayFilter={applyArrayFilter}
                      filter={filter}
                      isLoading={isFiltersLoading}
                      colors={colors}
                    />
                    <FilterSize
                      applyArrayFilter={applyArrayFilter}
                      filter={filter}
                      isLoading={isFiltersLoading}
                      sizes={sizes}
                    />
                    <FilterPrice
                      setFilter={setFilter}
                      filter={filter}
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      defaultPrice={DEFAULT_CUSTOM_PRICE}
                    />
                    <Button
                      variant="transparent"
                      className="mt-4 p-0 hover:opacity-75"
                      onClick={resetFilter}
                    >
                      Reset Filter
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* ===== PRODUCTS GRID ===== */}
          {isProductsLoading ? (
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </ul>
          ) : isError ? (
            <ErrorAlert description="Gagal mendapatkan data produk." />
          ) : (
            <ProductGrid products={products} />
          )}

          {/* ===== PAGINATION ===== */}
          <div className="mt-12 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={handlePreviousPage}
                    disabled={isPrevDisabled}
                  />
                </PaginationItem>
                <PaginationItem>
                  <Button variant="ghost">{pages}</Button>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={handleNextPage}
                    disabled={isNextDisabled}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </section>
      </div>
    </main>
  );
}
