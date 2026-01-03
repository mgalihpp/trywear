import type { Returns } from "@repo/db";
import {
  createReturnSchema,
  returnIdSchema,
  updateReturnStatusSchema,
} from "@repo/schema";
import type { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AppResponse } from "@/utils/appResponse";
import { BaseController } from "../controller";
import { ReturnService } from "./return.service";

export class ReturnController extends BaseController<Returns, ReturnService> {
  constructor() {
    super(new ReturnService());
  }

  /**
   * Get all returns (admin) or by user
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const returns = await this.service.findAll({});

    return new AppResponse({
      res,
      data: returns,
    });
  });

  /**
   * Get user's returns
   */
  getByUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const returns = await this.service.findAll({ userId });

    return new AppResponse({
      res,
      data: returns,
    });
  });

  /**
   * Get return by ID
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = returnIdSchema.parse(req.params);
    const returnData = await this.service.findById(id);

    return new AppResponse({
      res,
      data: returnData,
    });
  });

  /**
   * Create a new return request (customer)
   */
  createReturn = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return new AppResponse({
        res,
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const parsed = createReturnSchema.parse(req.body);
    const returnData = await this.service.createReturn(parsed, userId);

    return new AppResponse({
      res,
      statusCode: 201,
      data: returnData,
    });
  });

  /**
   * Update return status (admin)
   */
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = returnIdSchema.parse(req.params);
    const parsed = updateReturnStatusSchema.parse(req.body);
    const returnData = await this.service.updateStatus(id, parsed);

    return new AppResponse({
      res,
      data: returnData,
    });
  });
}
