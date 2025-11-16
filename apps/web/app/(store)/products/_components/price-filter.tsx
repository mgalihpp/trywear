import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Slider } from "@repo/ui/components/slider";
import { cn } from "@repo/ui/lib/utils";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/features/admin/utils";
import { PRICE_FILTERS } from "@/features/product/constants";
import { useDebounce } from "@/hooks/useDebounce";
import type { FilterProps } from "@/types/index";

interface FilterPriceProps {
  setFilter: React.Dispatch<React.SetStateAction<FilterProps>>;
  filter: FilterProps;
  minPrice: number;
  maxPrice: number;
  defaultPrice: [number, number];
}

const FilterPrice: React.FC<FilterPriceProps> = ({
  setFilter,
  filter,
  minPrice,
  maxPrice,
  defaultPrice,
}) => {
  const [tempRange, setTempRange] = useState<[number, number]>(
    filter.price.range,
  );

  const debouncedRange = useDebounce(tempRange, 500);

  useEffect(() => {
    if (filter.price.isCustom) {
      setFilter((prev: any) => ({
        ...prev,
        price: {
          ...prev.price,
          range: debouncedRange,
        },
      }));
    }
  }, [debouncedRange]);

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="price">
        <AccordionTrigger className="hover:no-underline">
          {PRICE_FILTERS.name}
        </AccordionTrigger>
        <AccordionContent className="pt-6">
          <ul className="space-y-4">
            {PRICE_FILTERS.option.map((price, index) => (
              <li key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`price-${index}`}
                  className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  onChange={() => {
                    setFilter((prev) => ({
                      ...prev,
                      price: {
                        isCustom: false,
                        range: [...price.value],
                      },
                    }));
                  }}
                  checked={
                    !filter.price.isCustom &&
                    filter.price.range[0] === price.value[0] &&
                    filter.price.range[1] === price.value[1]
                  }
                />

                <label
                  htmlFor={`price-${index}`}
                  className={cn("ml-3 text-sm capitalize text-gray-600", {
                    "font-medium text-gray-900":
                      filter.price.range[0] === price.value[0] &&
                      filter.price.range[1] === price.value[1],
                  })}
                >
                  {price.label}
                </label>
              </li>
            ))}
            <li className="flex flex-col justify-center gap-1">
              <div className="flex items-center">
                <input
                  type="radio"
                  id={`price-${PRICE_FILTERS.option.length}`}
                  className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  onChange={() => {
                    setFilter((prev) => ({
                      ...prev,
                      price: {
                        isCustom: true,
                        range: filter.price.isCustom ? [0, 10] : [0, 1000000],
                      },
                    }));
                  }}
                  checked={filter.price.isCustom}
                />
                <label
                  htmlFor={`price-${PRICE_FILTERS.option.length}`}
                  className="ml-3 text-sm text-gray-600"
                >
                  Custom
                </label>
              </div>
              <div className="flex justify-between">
                <span>
                  {formatCurrency(tempRange[0])} -{" "}
                  {formatCurrency(tempRange[1])}
                </span>
              </div>
              <Slider
                disabled={!filter.price.isCustom}
                onValueChange={(value) =>
                  setTempRange(value as [number, number])
                }
                value={tempRange}
                min={defaultPrice[0]}
                max={defaultPrice[1]}
                step={50000}
              />
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FilterPrice;
