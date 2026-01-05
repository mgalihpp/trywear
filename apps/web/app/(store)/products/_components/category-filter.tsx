import type { Categories } from "@repo/db";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import type { FilterProps } from "@/types/index";

interface FilterCategoryProps {
  setFilter: React.Dispatch<React.SetStateAction<FilterProps>>;
  filter: FilterProps;
  isLoading: boolean;
  categories: Categories[] | undefined;
}

const FilterCategory: React.FC<FilterCategoryProps> = ({
  setFilter,
  filter,
  isLoading,
  categories,
}) => {
  const selectedCategory = filter.category;

  return (
    <Accordion type="single" collapsible defaultValue="category">
      <AccordionItem value="category" className="border-b-0">
        <AccordionTrigger className="hover:no-underline py-3">
          <div className="flex items-center gap-2">
            <span>Kategori</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2 pb-4">
          {isLoading ? (
            <FilterCategorySkeleton />
          ) : !categories || categories.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              Kategori tidak ditemukan.
            </p>
          ) : (
            <div className="space-y-1">
              {/* Semua Kategori */}
              <button
                type="button"
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-secondary text-foreground",
                )}
                onClick={() => {
                  setFilter((prev) => ({
                    ...prev,
                    category: null,
                  }));
                }}
              >
                <span>Semua Kategori</span>
              </button>

              {/* Category List */}
              {categories.map((category) => {
                const isSelected = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                      isSelected
                        ? "bg-secondary text-foreground font-medium"
                        : "hover:bg-secondary text-foreground",
                    )}
                    onClick={() => {
                      setFilter((prev) => ({
                        ...prev,
                        category: category.id,
                      }));
                    }}
                  >
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const FilterCategorySkeleton = () => {
  return (
    <div className="space-y-1">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton className="h-10 w-full rounded-lg" key={index} />
      ))}
    </div>
  );
};

export default FilterCategory;
