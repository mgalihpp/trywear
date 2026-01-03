"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnController = void 0;
const schema_1 = require("@repo/schema");
const asyncHandler_1 = require("../../middleware/asyncHandler");
const appResponse_1 = require("../../utils/appResponse");
const controller_1 = require("../controller");
const return_service_1 = require("./return.service");
class ReturnController extends controller_1.BaseController {
    constructor() {
        super(new return_service_1.ReturnService());
    }
    /**
     * Get all returns (admin) or by user
     */
    getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const returns = await this.service.findAll({});
        return new appResponse_1.AppResponse({
            res,
            data: returns,
        });
    });
    /**
     * Get user's returns
     */
    getByUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user?.id;
        const returns = await this.service.findAll({ userId });
        return new appResponse_1.AppResponse({
            res,
            data: returns,
        });
    });
    /**
     * Get return by ID
     */
    getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.returnIdSchema.parse(req.params);
        const returnData = await this.service.findById(id);
        return new appResponse_1.AppResponse({
            res,
            data: returnData,
        });
    });
    /**
     * Create a new return request (customer)
     */
    createReturn = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return new appResponse_1.AppResponse({
                res,
                statusCode: 401,
                message: "Unauthorized",
            });
        }
        const parsed = schema_1.createReturnSchema.parse(req.body);
        const returnData = await this.service.createReturn(parsed, userId);
        return new appResponse_1.AppResponse({
            res,
            statusCode: 201,
            data: returnData,
        });
    });
    /**
     * Update return status (admin)
     */
    updateStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.returnIdSchema.parse(req.params);
        const parsed = schema_1.updateReturnStatusSchema.parse(req.body);
        const returnData = await this.service.updateStatus(id, parsed);
        return new appResponse_1.AppResponse({
            res,
            data: returnData,
        });
    });
}
exports.ReturnController = ReturnController;
