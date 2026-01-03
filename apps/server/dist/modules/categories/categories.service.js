"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const service_1 = require("../service");
class CategoriesService extends service_1.BaseService {
    constructor() {
        super("categories");
    }
    findAll = async () => {
        return await this.db[this.model].findMany({
            where: {},
            include: {
                parent: true,
                children: true,
                _count: {
                    select: { products: true },
                },
            },
            orderBy: {
                id: "asc",
            },
        });
    };
    findById = async (id) => {
        return await this.db[this.model].findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                _count: {
                    select: { products: true },
                },
            },
        });
    };
}
exports.CategoriesService = CategoriesService;
