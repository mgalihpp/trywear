"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idempotencyMiddleware = void 0;
const db_1 = require("@repo/db");
const idempotencyMiddleware = async (req, res, next) => {
    const key = (req.header("x-idempotency-key") || "").trim();
    if (!key)
        return next();
    const record = await db_1.db.idempotencyKeys.findUnique({ where: { key } });
    if (record?.order_id) {
        // order already created for this key — return it immediately
        const order = await db_1.db.orders.findUnique({
            where: { id: record.order_id },
            include: { order_items: true, payments: true },
        });
        return res.status(200).json({ idempotent: true, order });
    }
    // attach key to request for later saving by controller/service
    req.idempotencyKey = key;
    next();
};
exports.idempotencyMiddleware = idempotencyMiddleware;
