import type { ProductVariants } from "@repo/db";
import {
  createVariantSchema,
  updateVariantSchema,
  variantIdParams,
} from "@repo/schema";
import type { Request, Response } from "express";
import z from "zod";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AppResponse } from "@/utils/appResponse";
import { BaseController } from "../controller";
import { ProductVariantsService } from "./variant.service";

export class ProductVariantsController extends BaseController<
  ProductVariants,
  ProductVariantsService
> {
  constructor() {
    super(new ProductVariantsService());
  }

  create = asyncHandler(async (req: Request, res: Response) => {
    if (Array.isArray(req.body)) {
      const parsed = z.array(createVariantSchema).parse(req.body);
      const newVariants = await this.service.createMany(parsed);
      return new AppResponse({
        res,
        data: newVariants,
        message: `Successfully created ${newVariants.length} variants.`,
      });
    }

    const parsed = createVariantSchema.parse(req.body);
    const newVariant = await this.service.create(parsed);

    return new AppResponse({
      res,
      data: newVariant,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateVariantSchema.parse(req.body);
    const { variantId } = variantIdParams.parse(req.params);
    const updatedVariant = await this.service.update(variantId, parsed);

    return new AppResponse({
      res,
      data: updatedVariant,
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { variantId } = variantIdParams.parse(req.params);
    const deletedVariant = await this.service.delete(variantId);

    return new AppResponse({
      res,
      data: deletedVariant,
    });
  });
}
