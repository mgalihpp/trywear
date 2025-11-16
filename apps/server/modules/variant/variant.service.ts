import type { ProductVariants } from "@repo/db";
import type {
  CreateVariantInput,
  UpdateVariantInput,
} from "@repo/schema/productSchema";
import { AppError } from "@/utils/appError";
import { InventoryService } from "../inventory/inventory.service";
import { BaseService } from "../service";

export class ProductVariantsService extends BaseService<
  ProductVariants,
  "productVariants"
> {
  inventoryService: InventoryService;

  constructor() {
    super("productVariants");
    this.inventoryService = new InventoryService();
  }

  async create(data: CreateVariantInput) {
    const {
      sku,
      product_id,
      additional_price_cents,
      option_values,
      stock_quantity,
      reserved_quantity,
      safety_stock,
    } = data;

    const createdVariant = await this.db[this.model].create({
      data: {
        additional_price_cents,
        sku,
        option_values,
        product: {
          connect: {
            id: product_id,
          },
        },
      },
    });

    const createdInventory = await this.inventoryService.createOrUpdate(
      createdVariant.id,
      {
        stock_quantity: stock_quantity ?? 0,
        reserved_quantity: reserved_quantity ?? 0,
        safety_stock: safety_stock ?? 0,
      },
    );

    return { variant: createdVariant, inventory: createdInventory };
  }

  async createMany(data: CreateVariantInput[]) {
    const createdVariants = await Promise.all(
      data.map(async (item) => {
        const createdVariant = await this.db[this.model].create({
          data: {
            sku: item.sku,
            additional_price_cents: item.additional_price_cents ?? 0,
            option_values: item.option_values,
            product: {
              connect: { id: item.product_id },
            },
          },
        });

        // buat inventory-nya langsung setelah variant dibuat
        await this.inventoryService.createOrUpdate(createdVariant.id, {
          stock_quantity: item.stock_quantity ?? 0,
          reserved_quantity: item.reserved_quantity ?? 0,
          safety_stock: item.safety_stock ?? 0,
        });

        return createdVariant;
      }),
    );

    return createdVariants;
  }

  async update(id: string, data: UpdateVariantInput) {
    //Cek apakah ada variant
    const variant = await this.db[this.model].findFirst({
      where: { id },
    });

    if (!variant) {
      throw AppError.notFound();
    }

    const updatedVariant = await this.db[this.model].update({
      where: {
        id,
      },
      data: {
        sku: data.sku,
        additional_price_cents: data.additional_price_cents ?? 0,
        option_values: data.option_values,
      },
    });

    await this.inventoryService.createOrUpdate(updatedVariant.id, {
      stock_quantity: data.stock_quantity ?? 0,
      reserved_quantity: data.reserved_quantity ?? 0,
      safety_stock: data.safety_stock ?? 0,
    });

    return updatedVariant;
  }

  async delete(id: string) {
    const existingVariant = await this.db[this.model].findFirst({
      where: {
        id,
      },
    });

    if (!existingVariant) {
      throw AppError.notFound();
    }

    // Deleting inventory
    const deletedVariantInventory = await this.db[this.model].delete({
      where: {
        id: existingVariant.id,
      },
    });

    return deletedVariantInventory;
  }

  async getAvailableColors() {
    const variants = await this.db.productVariants.findMany({
      select: { option_values: true },
    });

    const colors = [
      ...new Set(
        variants
          .map((v) => {
            // Ensure option_values is an object and has 'color'
            if (
              typeof v.option_values === "object" &&
              v.option_values !== null &&
              "color" in v.option_values
            ) {
              return v.option_values.color;
            }
            return undefined;
          })
          .filter(Boolean),
      ),
    ];

    return colors;
  }

  async getAvailableSizes() {
    const variants = await this.db.productVariants.findMany({
      select: { option_values: true },
    });

    const rawSizes = variants
      .map((v) => {
        if (
          typeof v.option_values === "object" &&
          v.option_values !== null &&
          "size" in v.option_values
        ) {
          return v.option_values.size;
        }
        return undefined;
      })
      .filter((s): s is string | number => s !== undefined && s !== null);

    const uniqueSizes = Array.from(new Set(rawSizes));

    // Detect if sizes are numeric (e.g., "36", 38)
    const allNumeric = uniqueSizes.every((s) => !Number.isNaN(Number(s)));

    // Common apparel size ordering (case-insensitive)
    const sizeOrder = new Map<string, number>([
      ["xxs", 0],
      ["xs", 1],
      ["s", 2],
      ["m", 3],
      ["l", 4],
      ["xl", 5],
      ["xxl", 6],
      ["3xl", 7],
      ["4xl", 8],
    ]);

    const comparator = (a: string | number, b: string | number) => {
      if (allNumeric) return Number(a) - Number(b);

      const aStr = String(a).toLowerCase();
      const bStr = String(b).toLowerCase();

      const aOrder = sizeOrder.has(aStr) ? sizeOrder.get(aStr)! : undefined;
      const bOrder = sizeOrder.has(bStr) ? sizeOrder.get(bStr)! : undefined;

      if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
      if (aOrder !== undefined) return -1;
      if (bOrder !== undefined) return 1;

      // Fallback: numeric compare if possible, else lexical
      const aNum = Number(a);
      const bNum = Number(b);
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;

      return aStr.localeCompare(bStr);
    };

    const sizes = uniqueSizes.sort(comparator);

    return sizes;
  }
}
