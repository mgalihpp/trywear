"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const appError_1 = require("../../utils/appError");
const service_1 = require("../service");
class CustomerService extends service_1.BaseService {
    constructor() {
        super("user");
    }
    findAll = async (segmentSlug) => {
        const customers = await this.db[this.model].findMany({
            where: segmentSlug
                ? {
                    segment: {
                        slug: segmentSlug,
                    },
                }
                : undefined,
            include: {
                segment: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        color: true,
                        icon: true,
                        discount_percent: true,
                    },
                },
                orders: {
                    include: {
                        payments: true,
                        shipments: true,
                        order_items: true,
                        returns: true,
                    },
                },
            },
            orderBy: {
                lifetime_spent: "desc",
            },
        });
        return customers;
    };
    findById = async (id) => {
        const customer = await this.db[this.model].findUnique({
            where: {
                id,
            },
            include: {
                segment: true,
                orders: true,
                addresses: true,
            },
        });
        if (!customer) {
            throw appError_1.AppError.notFound("Customer not found");
        }
        return customer;
    };
}
exports.CustomerService = CustomerService;
