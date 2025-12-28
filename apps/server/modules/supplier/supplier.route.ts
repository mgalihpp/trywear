import { Router } from "express";
import { authenticateMiddleware } from "@/middleware/authenticated";
import { SupplierController } from "./supplier.controller";

const supplierRouter = Router();
const supplierController = new SupplierController();

/**
 * @swagger
 * tags:
 *   name: Suppliers
 *   description: Supplier management endpoints
 */

supplierRouter.use(authenticateMiddleware);

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

export { supplierRouter };
