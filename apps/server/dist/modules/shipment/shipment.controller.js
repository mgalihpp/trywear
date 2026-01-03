"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentController = void 0;
const schema_1 = require("@repo/schema");
const asyncHandler_1 = require("../../middleware/asyncHandler");
const appResponse_1 = require("../../utils/appResponse");
const controller_1 = require("../controller");
const shipment_service_1 = require("./shipment.service");
class ShipmentController extends controller_1.BaseController {
    constructor() {
        super(new shipment_service_1.ShipmentService());
    }
    create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const parsed = schema_1.createShipmentsSchema.parse(req.body);
        const newShipment = await this.service.create(parsed);
        return new appResponse_1.AppResponse({
            res,
            data: newShipment,
        });
    });
    update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.shipmentIdParams.parse(req.params);
        const parsed = schema_1.updateShipmetsSchema.parse(req.body);
        const updatedShipment = await this.service.update(id, parsed);
        return new appResponse_1.AppResponse({
            res,
            data: updatedShipment,
        });
    });
}
exports.ShipmentController = ShipmentController;
