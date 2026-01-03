"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierController = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const appError_1 = require("../../utils/appError");
const supplier_service_1 = require("./supplier.service");
class SupplierController {
    supplierService;
    constructor() {
        this.supplierService = new supplier_service_1.SupplierService();
    }
    /**
     * GET /api/v1/suppliers
     */
    getAll = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const suppliers = await this.supplierService.findAll();
        return res.status(200).json({
            status: "success",
            data: suppliers,
        });
    });
    /**
     * GET /api/v1/suppliers/:id
     */
    getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = parseInt(req.params.id);
        const supplier = await this.supplierService.getById(id);
        if (!supplier) {
            throw appError_1.AppError.notFound("Supplier tidak ditemukan");
        }
        return res.status(200).json({
            status: "success",
            data: supplier,
        });
    });
    /**
     * POST /api/v1/suppliers
     */
    create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const supplier = await this.supplierService.create(req.body);
        return res.status(201).json({
            status: "success",
            message: "Supplier berhasil ditambahkan",
            data: supplier,
        });
    });
    /**
     * PATCH /api/v1/suppliers/:id
     */
    update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = parseInt(req.params.id);
        const supplier = await this.supplierService.update(id, req.body);
        return res.status(200).json({
            status: "success",
            message: "Supplier berhasil diperbarui",
            data: supplier,
        });
    });
    /**
     * DELETE /api/v1/suppliers/:id
     */
    delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = parseInt(req.params.id);
        // Check if supplier has products
        const supplier = await this.supplierService.getById(id);
        if (supplier && supplier.products.length > 0) {
            throw appError_1.AppError.badRequest("Tidak dapat menghapus supplier yang memiliki produk");
        }
        await this.supplierService.delete(id);
        return res.status(200).json({
            status: "success",
            message: "Supplier berhasil dihapus",
        });
    });
}
exports.SupplierController = SupplierController;
