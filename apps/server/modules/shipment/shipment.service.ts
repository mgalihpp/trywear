import type { Shipments } from "@repo/db";
import type { CreateShipmentsInput, UpdateShipmetsSchema } from "@repo/schema";
import { AppError } from "@/utils/appError";
import { BaseService } from "../service";

export class ShipmentService extends BaseService<Shipments, "shipments"> {
  constructor() {
    super("shipments");
  }

  create = async (input: CreateShipmentsInput) => {
    const newShipment = await this.db[this.model].create({
      data: {
        order_id: input.order_id,
        shipment_method_id: input.shipment_method_id,
        delivered_at: null, // Null karena baru dikirim barangnya
        shipped_at: new Date(),
        status: input.status,
        tracking_number: input.tracking_number,
      },
    });

    return newShipment;
  };

  update = async (shipment_id: string, input: UpdateShipmetsSchema) => {
    const shipment = await this.db[this.model].findFirst({
      where: {
        id: shipment_id,
      },
    });

    if (!shipment) {
      throw AppError.notFound();
    }

    const updatedShipment = await this.db[this.model].update({
      where: {
        id: shipment.id,
      },
      data: {
        ...input,
      },
    });

    return updatedShipment;
  };
}
