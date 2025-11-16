import type { Orders } from "@repo/db";
import { AppError } from "@/utils/appError";
import { BaseService } from "../service";

export class OrderService extends BaseService<Orders, "orders"> {
  constructor() {
    super("orders");
  }

  findAll = async () => {
    return await this.db[this.model].findMany({
      include: {
        order_items: true,
        user: true,
      },
    });
  };

  findById = async (id: string) => {
    const order = await this.db[this.model].findFirst({
      where: {
        id,
      },
      include: {
        address: true,
        order_items: {
          include: {
            variant: true,
          },
        },
        payments: true,
        returns: true,
        shipments: true,
        user: true,
      },
    });

    if (!order) {
      throw AppError.notFound("Order Not Found");
    }

    return order;
  };
}
