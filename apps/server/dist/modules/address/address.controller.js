"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressController = void 0;
const schema_1 = require("@repo/schema");
const http_1 = require("../../configs/http");
const asyncHandler_1 = require("../../middleware/asyncHandler");
const appResponse_1 = require("../../utils/appResponse");
const controller_1 = require("../controller");
const address_service_1 = require("./address.service");
class AddressController extends controller_1.BaseController {
    constructor() {
        super(new address_service_1.AddressService());
    }
    getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const addresses = await this.service.findAll(req.user?.id);
        return new appResponse_1.AppResponse({
            res,
            data: addresses,
        });
    });
    create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const input = {
            ...req.body,
            user_id: req.user?.id,
        };
        const parsed = schema_1.createAddressSchema.parse(input);
        const newAddress = await this.service.create(parsed);
        return new appResponse_1.AppResponse({
            res,
            data: newAddress,
            statusCode: http_1.HTTPSTATUS.CREATED,
        });
    });
    update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.paramsIdSchema.parse(req.params);
        const parsed = schema_1.updateAddressSchema.parse(req.body);
        const updatedAddress = await this.service.update(Number(id), parsed);
        return new appResponse_1.AppResponse({
            res,
            data: updatedAddress,
        });
    });
    delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.paramsIdSchema.parse(req.params);
        const deletedAddress = await this.service.delete(Number(id));
        return new appResponse_1.AppResponse({ res, data: deletedAddress });
    });
}
exports.AddressController = AddressController;
