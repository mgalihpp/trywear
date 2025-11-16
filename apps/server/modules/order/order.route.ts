import { Router } from "express";
import { OrderController } from "./order.controller";

const orderRouter = Router();
const orderController = new OrderController();
/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management endpoints
 */

orderRouter.get("/", orderController.getAll);
orderRouter.get("/:id", orderController.getById);

export { orderRouter };
