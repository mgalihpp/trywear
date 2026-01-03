"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentService = void 0;
const appError_1 = require("../../utils/appError");
const service_1 = require("../service");
class ShipmentService extends service_1.BaseService {
    constructor() {
        super("shipments");
    }
    create = async (input) => {
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
    update = async (shipment_id, input) => {
        const shipment = await this.db[this.model].findFirst({
            where: {
                id: shipment_id,
            },
        });
        if (!shipment) {
            throw appError_1.AppError.notFound();
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
exports.ShipmentService = ShipmentService;
