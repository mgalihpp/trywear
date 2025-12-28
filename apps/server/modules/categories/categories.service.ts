import type { Categories } from "@repo/db";
import { BaseService } from "../service";

export class CategoriesService extends BaseService<Categories, "categories"> {
  constructor() {
    super("categories");
  }

  findAll = async () => {
    return await this.db[this.model].findMany({
      where: {},
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        id: "asc",
      },
    });
  };

  findById = async (id: number) => {
    return await this.db[this.model].findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true },
        },
      },
    });
  };
}
