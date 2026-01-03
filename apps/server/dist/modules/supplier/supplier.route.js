"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierRouter = void 0;
const express_1 = require("express");
const authenticated_1 = require("../../middleware/authenticated");
const supplier_controller_1 = require("./supplier.controller");
const supplierRouter = (0, express_1.Router)();
exports.supplierRouter = supplierRouter;
const supplierController = new supplier_controller_1.SupplierController();
/**
 * @swagger
 * tags:
 *   name: Suppliers
 *   description: Supplier management endpoints
 */
supplierRouter.use(authenticated_1.authenticateMiddleware);
/**
 * @swagger
 * /api/v1/suppliers:
 *   get:
 *     summary: List all suppliers
 *     tags: [Suppliers]
 *   post:
 *     summary: Create new supplier
 *     tags: [Suppliers]
 */
supplierRouter.get("/", supplierController.getAll);
supplierRouter.post("/", supplierController.create);
/**
 * @swagger
 * /api/v1/suppliers/{id}:
 *   get:
 *     summary: Get supplier by ID
 *     tags: [Suppliers]
 *   patch:
 *     summary: Update supplier
 *     tags: [Suppliers]
 *   delete:
 *     summary: Delete supplier
 *     tags: [Suppliers]
 */
supplierRouter.get("/:id", supplierController.getById);
supplierRouter.patch("/:id", supplierController.update);
supplierRouter.delete("/:id", supplierController.delete);
