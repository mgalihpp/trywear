import type { Shipments } from "@repo/db";
import {
  createShipmentsSchema,
  shipmentIdParams,
  updateShipmetsSchema,
} from "@repo/schema";
import type { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AppResponse } from "@/utils/appResponse";
import { BaseController } from "../controller";
import { ShipmentService } from "./shipment.service";

export class ShipmentController extends BaseController<
  Shipments,
  ShipmentService
> {
  constructor() {
    super(new ShipmentService());
  }

  create = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createShipmentsSchema.parse(req.body);

    const newShipment = await this.service.create(parsed);

    return new AppResponse({
      res,
      data: newShipment,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = shipmentIdParams.parse(req.params);
    const parsed = updateShipmetsSchema.parse(req.body);

    const updatedShipment = await this.service.update(id, parsed);

    return new AppResponse({
      res,
      data: updatedShipment,
    });
  });
}
