import type { Suppliers } from "@repo/db";
import { BaseService } from "../service";

export class SupplierService extends BaseService<Suppliers, "suppliers"> {
  constructor() {
    super("suppliers");
  }

  /**
   * Get all suppliers with product count
   */
  async findAll() {
    return await this.db.suppliers.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Get supplier by ID with products
   */
  async getById(id: number) {
    return await this.db.suppliers.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            title: true,
            sku: true,
            status: true,
          },
        },
      },
    });
  }
}
