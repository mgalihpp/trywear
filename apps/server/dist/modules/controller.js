"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const schema_1 = require("@repo/schema");
const asyncHandler_1 = require("../middleware/asyncHandler");
const appResponse_1 = require("../utils/appResponse");
class BaseController {
    service;
    constructor(service) {
        this.service = service;
    }
    /**
     * Menangani permintaan POST untuk membuat data baru.
     */
    create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const data = (await this.service.create(req.body));
        new appResponse_1.AppResponse({
            res,
            data,
        });
    });
    /**
     * Menangani permintaan PUT untuk memperbarui data berdasarkan ID.
     */
    update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.paramsIdSchema.parse(req.params);
        const data = (await this.service.update(id, req.body));
        new appResponse_1.AppResponse({
            res,
            data,
        });
    });
    /**
     * Menangani permintaan DELETE untuk menghapus data berdasarkan ID.
     */
    delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.paramsIdSchema.parse(req.params);
        const data = (await this.service.delete(id));
        new appResponse_1.AppResponse({
            res,
            data,
        });
    });
}
exports.BaseController = BaseController;
