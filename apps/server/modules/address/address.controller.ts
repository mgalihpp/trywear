import type { Addresses } from "@repo/db";
import {
  createAddressSchema,
  paramsIdSchema,
  updateAddressSchema,
} from "@repo/schema";
import type { Request, Response } from "express";
import { HTTPSTATUS } from "@/configs/http";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AppResponse } from "@/utils/appResponse";
import { BaseController } from "../controller";
import { AddressService } from "./address.service";

export class AddressController extends BaseController<
  Addresses,
  AddressService
> {
  constructor() {
    super(new AddressService());
  }

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const addresses = await this.service.findAll(req.user?.id as string);

    return new AppResponse({
      res,
      data: addresses,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const input = {
      ...req.body,
      user_id: req.user?.id,
    };
    const parsed = createAddressSchema.parse(input);

    const newAddress = await this.service.create(parsed);

    return new AppResponse({
      res,
      data: newAddress,
      statusCode: HTTPSTATUS.CREATED,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = paramsIdSchema.parse(req.params);
    const parsed = updateAddressSchema.parse(req.body);

    const updatedAddress = await this.service.update(Number(id), parsed);

    return new AppResponse({
      res,
      data: updatedAddress,
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = paramsIdSchema.parse(req.params);

    const deletedAddress = await this.service.delete(Number(id));

    return new AppResponse({ res, data: deletedAddress });
  });
}
