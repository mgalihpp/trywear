/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { Package, Plus, Trash2 } from "lucide-react";
import {
  type ChangeEvent,
  type KeyboardEvent,
  type SetStateAction,
  useState,
} from "react";
import { toast } from "sonner";
import type { VariantCombination, VariantOption } from "@/types/index";
import { StockCard } from "./stock-card";
import { VariantFilter } from "./variant-filter";

export function ProductVariantsSection({
  sku,
  variantOptions,
  setVariantOptions,
  variantCombinations,
  setVariantCombinations,
}: {
  sku: string;
  variantOptions: VariantOption[];
  variantCombinations: VariantCombination[];
  setVariantOptions: React.Dispatch<SetStateAction<VariantOption[]>>;
  setVariantCombinations: React.Dispatch<SetStateAction<VariantCombination[]>>;
}) {
  const [newOptionName, setNewOptionName] = useState("");
  const [values, setValues] = useState<string[]>([]); // tiap option punya input value sendiri
  const [filteredCombinations, setFilteredCombinations] = useState<
    VariantCombination[]
  >([]);

  const handleChange = (index: number, newValue: string) => {
    const newValues = [...values];
    newValues[index] = newValue;
    setValues(newValues);
  };

  const handleAdd = (index: number) => {
    const value = values[index]?.trim();
    if (!value) return;

    addValueToOption(index, value);
    handleChange(index, ""); // reset input setelah tambah
  };

  const handleKeyPress = (
    e: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd(index);
    }
  };

  // Generate all variant combinations
  const generateVariantCombinations = () => {
    if (
      variantOptions.length === 0 ||
      variantOptions.some((opt) => opt.values.length === 0)
    ) {
      setVariantCombinations([]);
      toast.error("Cannot Generate Variant Combinations");
      return;
    }

    const combinations: VariantCombination[] = [];
    const optionNames = variantOptions.map((opt) => opt.name);
    const optionValues = variantOptions.map((opt) => opt.values);

    const generate = (index: number, current: Record<string, string>) => {
      if (index === optionNames.length) {
        const existing = variantCombinations.find(
          (combo) =>
            JSON.stringify(combo.option_values) === JSON.stringify(current),
        );
        combinations.push({
          sku: `${sku}-${Object.values(current).join("-")}`,
          option_values: { ...current },
          stock_quantity: existing?.stock_quantity ?? 0,
          reserved_quantity: existing?.reserved_quantity ?? 0,
          safety_stock: existing?.safety_stock ?? 0,
          additional_price_cents: existing?.additional_price_cents ?? 0,
        });
        return;
      }

      for (const value of optionValues[index] ?? []) {
        generate(index + 1, { ...current, [optionNames[index]!]: value });
      }
    };

    generate(0, {});
    setVariantCombinations(combinations);
  };

  const addVariantOption = () => {
    if (!newOptionName.trim()) {
      toast.error("Please enter a variant option name");
      return;
    }

    if (
      variantOptions.some((opt) => opt.name === newOptionName.toLowerCase())
    ) {
      toast.error("This variant option already exists");
      return;
    }

    setVariantOptions([
      ...variantOptions,
      { name: newOptionName.toLowerCase(), values: [] },
    ]);
    setNewOptionName("");
  };

  const addValueToOption = (optionIndex: number, value: string) => {
    if (!value.trim()) return;

    const newOptions = [...variantOptions];
    if (!newOptions[optionIndex]!.values.includes(value)) {
      newOptions[optionIndex]!.values.push(value);
      setVariantOptions(newOptions);
    }
  };

  const removeValueFromOption = (optionIndex: number, valueIndex: number) => {
    const newOptions = [...variantOptions];
    newOptions[optionIndex]!.values.splice(valueIndex, 1);
    setVariantOptions(newOptions);
  };

  const removeVariantOption = (index: number) => {
    const newOptions = [...variantOptions];
    newOptions.splice(index, 1);
    setVariantOptions(newOptions);
  };

  const updateVariantStock = (
    sku: string,
    field:
      | "stock_quantity"
      | "reserved_quantity"
      | "safety_stock"
      | "additional_price_cents",
    value: number,
  ) => {
    const newCombinations = variantCombinations.map((c) =>
      c.sku === sku ? { ...c, [field]: value } : c,
    );
    setVariantCombinations(newCombinations);
  };

  const displayedCombinations =
    filteredCombinations.length > 0
      ? variantCombinations.filter((c) =>
          filteredCombinations.some((fc) => fc.sku === c.sku),
        )
      : variantCombinations;

  return (
    <>
      <Card>
        <CardHeader>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild className="w-fit">
                <CardTitle className="flex items-center gap-2 cursor-help border-dashed border-b border-foreground">
                  Opsi Varian Produk
                </CardTitle>
              </TooltipTrigger>
              <TooltipContent className="w-56">
                Tambahkan atau atur kombinasi varian produk seperti warna,
                ukuran, atau tipe.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <CardDescription>
            Tentukan variasi produk (misal, size, color)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Variant Option */}
          <div className="grid lg:grid-cols-2 gap-2">
            <Input
              placeholder="Size"
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addVariantOption();
                }
              }}
            />
            <Button type="button" onClick={addVariantOption} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Tambahkan Opsi
            </Button>
          </div>

          {/* Existing Variant Options */}
          {variantOptions.map((option, optionIndex) => (
            <div key={optionIndex} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold capitalize">{option.name}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  className="hover:bg-destructive/10"
                  size="sm"
                  onClick={() => removeVariantOption(optionIndex)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {option.values.map((value, valueIndex) => (
                  <div
                    key={valueIndex}
                    className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-md"
                  >
                    <span>{value}</span>
                    <button
                      type="button"
                      onClick={() =>
                        removeValueFromOption(optionIndex, valueIndex)
                      }
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder={`Tambah ${option.name} value`}
                  value={values[optionIndex] || ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleChange(optionIndex, e.currentTarget.value)
                  }
                  onKeyDown={(e) => handleKeyPress(e, optionIndex)}
                />
                <Button
                  type="button"
                  onClick={() => {
                    handleAdd(optionIndex);
                  }}
                >
                  <Plus />
                </Button>
              </div>
            </div>
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-2">
            <Button
              type="button"
              onClick={generateVariantCombinations}
              className="w-full"
              variant="default"
              disabled={variantOptions.length === 0}
            >
              <Package className="h-4 w-4 mr-2" />
              Generate Kombinasi Varian
              {variantCombinations.length > 0 &&
                `(${variantCombinations.length})`}
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (confirm("Yakin ingin menghapus semua varian dan opsi?")) {
                  setVariantOptions([]);
                  setVariantCombinations([]);
                  toast.success(
                    "Semua opsi dan kombinasi varian telah dihapus",
                  );
                }
              }}
              className="w-full"
              variant="destructive"
              disabled={variantCombinations.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus varian
            </Button>
          </div>
        </CardContent>
      </Card>

      {variantCombinations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory Management</CardTitle>
            <CardDescription>
              Tetapkan tingkat stok untuk setiap kombinasi varian
            </CardDescription>
            <CardAction>
              <VariantFilter
                variantOptions={variantOptions}
                onFilterChange={(filters) => {
                  if (Object.keys(filters).length === 0) {
                    setFilteredCombinations([]);
                    return;
                  }

                  const filtered = variantCombinations.filter((combo) =>
                    Object.entries(filters).every(([key, values]) =>
                      values.includes(combo.option_values[key]!),
                    ),
                  );

                  setFilteredCombinations(filtered);
                }}
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-2">
              {displayedCombinations.map((combo, index) => (
                <StockCard
                  combo={combo}
                  key={index}
                  updateVariantStock={updateVariantStock}
                  variantOptions={variantOptions}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
