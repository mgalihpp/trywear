import type { Orders } from "@repo/db";
import { orderIdSchema } from "@repo/schema/orderSchema";
import type { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AppResponse } from "@/utils/appResponse";
import { BaseController } from "../controller";
import { OrderService } from "./order.service";

export class OrderController extends BaseController<Orders, OrderService> {
  constructor() {
    super(new OrderService());
  }

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const orders = await this.service.findAll();

    return new AppResponse({
      res,
      data: orders,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = orderIdSchema.parse(req.params);
    const order = await this.service.findById(id);

    return new AppResponse({
      res,
      data: order,
    });
  });
}
