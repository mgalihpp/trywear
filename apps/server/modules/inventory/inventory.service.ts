import type { Inventory } from "@repo/db";
import type { CreateInventoryInput } from "@repo/schema/productSchema";
import { AppError } from "@/utils/appError";
import { BaseService } from "../service";

export class InventoryService extends BaseService<Inventory, "inventory"> {
  constructor() {
    super("inventory");
  }

  async get(variantId: string) {
    const variantStock = await this.db[this.model].findUnique({
      where: {
        variant_id: variantId,
      },
    });

    if (!variantStock) {
      throw AppError.notFound();
    }

    return variantStock;
  }

  async createOrUpdate(variantId: string, data: CreateInventoryInput) {
    return await this.db[this.model].upsert({
      where: { variant_id: variantId },
      create: {
        ...data,
        variant: {
          connect: { id: variantId },
        },
      },
      update: {
        ...data,
      },
    });
  }
}
