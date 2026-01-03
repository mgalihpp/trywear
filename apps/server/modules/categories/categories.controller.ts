import type { Categories } from "@repo/db";
import {
  createCategorySchema,
  paramsIdSchema,
  updateCategorySchema,
} from "@repo/schema";
import type { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AppResponse } from "@/utils/appResponse";
import { BaseController } from "../controller";
import { CategoriesService } from "./categories.service";

export class CategoriesController extends BaseController<
  Categories,
  CategoriesService
> {
  constructor() {
    super(new CategoriesService());
  }

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const cats = await this.service.findAll();

    new AppResponse({
      res,
      data: cats,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = paramsIdSchema.parse(req.params);
    const cat = await this.service.findById(Number(id));

    if (!cat) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    new AppResponse({
      res,
      data: cat,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createCategorySchema.parse(req.body);
    const cat = await this.service.create(parsed);

    new AppResponse({
      res,
      data: cat,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateCategorySchema.parse(req.body);
    const { id } = paramsIdSchema.parse(req.params);

    const cat = await this.service.update(Number(id), parsed);

    new AppResponse({
      res,
      data: cat,
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = paramsIdSchema.parse(req.params);

    await this.service.delete(Number(id));

    new AppResponse({
      res,
      message: "Successfully Delete Category",
    });
  });
}
