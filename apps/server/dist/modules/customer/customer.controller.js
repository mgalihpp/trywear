"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const schema_1 = require("@repo/schema");
const asyncHandler_1 = require("../../middleware/asyncHandler");
const appResponse_1 = require("../../utils/appResponse");
const controller_1 = require("../controller");
const customer_service_1 = require("./customer.service");
class CustomerController extends controller_1.BaseController {
    constructor() {
        super(new customer_service_1.CustomerService());
    }
    getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const segmentSlug = req.query.segment;
        const customers = await this.service.findAll(segmentSlug);
        return new appResponse_1.AppResponse({
            res,
            data: customers,
        });
    });
    getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.paramsIdSchema.parse(req.params);
        const customers = await this.service.findById(id);
        return new appResponse_1.AppResponse({
            res,
            data: customers,
        });
    });
}
exports.CustomerController = CustomerController;
