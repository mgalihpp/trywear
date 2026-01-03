"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const db_1 = require("@repo/db");
const appError_1 = require("../../utils/appError");
class UserService {
    db = db_1.db;
    async getUsers(params) {
        const { page = 1, limit = 10, search, role } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }
        if (role) {
            where.role = role;
        }
        const [total, users] = await Promise.all([
            this.db.user.count({ where }),
            this.db.user.findMany({
                where,
                take: limit,
                skip,
                orderBy: { name: "asc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    image: true,
                },
            }),
        ]);
        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async updateUserRole(id, role) {
        const user = await this.db.user.findUnique({ where: { id } });
        if (!user) {
            throw appError_1.AppError.notFound("User not found");
        }
        const updatedUser = await this.db.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
        return updatedUser;
    }
}
exports.UserService = UserService;
