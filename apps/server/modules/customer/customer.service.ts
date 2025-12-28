import type { User } from "@repo/db";
import { AppError } from "@/utils/appError";
import { BaseService } from "../service";

export class CustomerService extends BaseService<User, "user"> {
  constructor() {
    super("user");
  }

  findAll = async (segmentSlug?: string) => {
    const customers = await this.db[this.model].findMany({
      where: segmentSlug
        ? {
            segment: {
              slug: segmentSlug,
            },
          }
        : undefined,
      include: {
        segment: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
            discount_percent: true,
          },
        },
        orders: {
          include: {
            payments: true,
            shipments: true,
            order_items: true,
            returns: true,
          },
        },
      },
      orderBy: {
        lifetime_spent: "desc",
      },
    });

    return customers;
  };

  findById = async (id: string) => {
    const customer = await this.db[this.model].findUnique({
      where: {
        id,
      },
      include: {
        segment: true,
        orders: true,
        addresses: true,
      },
    });

    if (!customer) {
      throw AppError.notFound("Customer not found");
    }

    return customer;
  };
}
