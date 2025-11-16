import { Button } from "@repo/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

type CategoryComboboxProps = {
  defaultValue?: string;
  onValueChange: (value: number) => void;
};

export function CategoryCombobox({
  defaultValue = "",
  onValueChange,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [categories, setCategories] = useState<
    { label: string; value: string }[]
  >([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: api.category.getAll,
  });

  const createCategoryMutation = useMutation({
    mutationFn: api.category.create,
  });

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Mohon masukkan nama kategori");
      return;
    }

    createCategoryMutation.mutate(
      {
        name: newCategoryName,
        slug: newCategoryName.toLowerCase().replace(/\s+/g, "-"),
      },
      {
        onSuccess: (data) => {
          const newValue = data.id.toString();

          const newCategory = {
            value: newValue,
            label: newCategoryName,
          };

          setCategories([...categories, newCategory]);
          setValue(newValue);
          onValueChange(Number(newValue));
          setNewCategoryName("");
          setDialogOpen(false);
          setOpen(false);
          toast.success("Kategori berhasil ditambah!");
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            if (error.response?.data.errorCode === "Field: slug") {
              setIsError(true);
              setErrorMessage("Kategori sudah ada.");
              toast.error("Kategori sudah ada. Silakan gunakan nama lain.");
            }
          }
        },
      },
    );
  };

  useEffect(() => {
    if (categoriesData?.length) {
      const mappedCategories = categoriesData.map((c) => ({
        label: c.name,
        value: c.id.toString(),
      }));
      setCategories(mappedCategories);
    }
  }, [categoriesData]);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-card hover:bg-accent transition-colors"
          >
            {value
              ? categories.find((category) => category.value === value)?.label
              : "Select category..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-popover" align="start">
          <Command>
            <CommandInput placeholder="Search category..." />
            <CommandList>
              <CommandEmpty>
                <div className="flex flex-col justify-center items-center gap-4">
                  <span>Kategori tidak ditemukan.</span>
                  {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
                  {/** biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                  <span
                    onClick={() => {
                      setOpen(false);
                      setDialogOpen(true);
                    }}
                    className="inline-flex underline items-center text-xs text-primary cursor-pointer"
                  >
                    <Plus className="size-2 mr-2" />
                    Tambah baru
                  </span>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem
                    key={category.value}
                    value={category.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      onValueChange(Number(currentValue));
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === category.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {category.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setDialogOpen(true);
                  }}
                  className="text-primary cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah kategori baru
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah kategori baru</DialogTitle>
            <DialogDescription>Buat kategori produk baru.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label
                htmlFor="category-name"
                className={isError ? "text-destructive" : ""}
              >
                Nama kategori
              </Label>
              <Input
                id="category-name"
                placeholder="e.g., Pet Supplies"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddCategory();
                  }
                }}
                aria-invalid={isError}
              />
              {isError && (
                <p className="text-destructive text-sm">{errorMessage}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={
                createCategoryMutation.isPending ||
                newCategoryName.trim().length === 0
              }
            >
              Tambah kategori
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
