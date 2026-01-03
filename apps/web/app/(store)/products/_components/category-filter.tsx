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
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="category">
        <AccordionTrigger className="hover:no-underline">
          Kategori
        </AccordionTrigger>
        <AccordionContent className="pt-6">
          {isLoading ? (
            <FilterCategorySkeleton />
          ) : !categories || categories.length === 0 ? (
            <p className="text-xs text-grey-3">Kategori tidak ditemukan.</p>
          ) : (
            <ul className="space-y-4">
              <li key={"all"}>
                <button
                  type="button"
                  className={cn(
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    {
                      "text-gray-900": filter.category === null,
                      "text-grey-3 hover:text-gray-900 hover:text-opacity-75":
                        filter.category !== null,
                    },
                  )}
                  onClick={() => {
                    setFilter((prev) => ({
                      ...prev,
                      category: null,
                    }));
                  }}
                >
                  Semua
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    type="button"
                    className={cn(
                      "disabled:cursor-not-allowed disabled:opacity-60",
                      {
                        "text-gray-900": filter.category === category.id,
                        "text-grey-3 hover:text-gray-900 hover:text-opacity-75":
                          filter.category !== category.id,
                      },
                    )}
                    onClick={() => {
                      setFilter((prev) => ({
                        ...prev,
                        category: category.id,
                      }));
                    }}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const FilterCategorySkeleton = () => {
  return Array.from({ length: 4 }, (_, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
    <Skeleton className="mb-4 h-5 w-full" key={index} />
  ));
};

export default FilterCategory;
