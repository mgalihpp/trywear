import type { Orders } from "@repo/db";
import type { ShipmentStatusType } from "@repo/schema";
import {
  createOrderSchema,
  orderIdSchema,
  updateOrderStatusSchema,
} from "@repo/schema";
import type { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AppResponse } from "@/utils/appResponse";
import { BaseController } from "../controller";
import { OrderService } from "./order.service";

export class OrderController extends BaseController<Orders, OrderService> {
  constructor() {
    super(new OrderService());
  }

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query;

    const orders = await this.service.findAll({
      status: query.status as ShipmentStatusType,
    });

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

  getByUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const orders = await this.service.findAll({ userId });

    return new AppResponse({
      res,
      data: orders,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createOrderSchema.parse(req.body);

    const idempotencyKey =
      req.idempotencyKey || (req.header("x-idempotency-key") as string);
    const result = await this.service.create(parsed, idempotencyKey);

    return new AppResponse({
      res,
      data: result,
    });
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = orderIdSchema.parse(req.params);
    const parsed = updateOrderStatusSchema.parse(req.body);

    const updatedOrder = await this.service.updateStatus(id, parsed);

    return new AppResponse({
      res,
      data: updatedOrder,
    });
  });
}
