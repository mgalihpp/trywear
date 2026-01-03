"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierService = void 0;
const service_1 = require("../service");
class SupplierService extends service_1.BaseService {
    constructor() {
        super("suppliers");
    }
    /**
     * Get all suppliers with product count
     */
    async findAll() {
        return await this.db.suppliers.findMany({
            include: {
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { name: "asc" },
        });
    }
    /**
     * Get supplier by ID with products
     */
    async getById(id) {
        return await this.db.suppliers.findUnique({
            where: { id },
            include: {
                products: {
                    select: {
                        id: true,
                        title: true,
                        sku: true,
                        status: true,
                    },
                },
            },
        });
    }
}
exports.SupplierService = SupplierService;
