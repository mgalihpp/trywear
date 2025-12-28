import type { User } from "@repo/db";
import { paramsIdSchema } from "@repo/schema";
import type { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AppResponse } from "@/utils/appResponse";
import { BaseController } from "../controller";
import { CustomerService } from "./customer.service";

export class CustomerController extends BaseController<User, CustomerService> {
  constructor() {
    super(new CustomerService());
  }

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const segmentSlug = req.query.segment as string | undefined;
    const customers = await this.service.findAll(segmentSlug);

    return new AppResponse({
      res,
      data: customers,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = paramsIdSchema.parse(req.params);
    const customers = await this.service.findById(id);

    return new AppResponse({
      res,
      data: customers,
    });
  });
}
