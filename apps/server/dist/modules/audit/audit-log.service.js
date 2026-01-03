"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const db_1 = require("@repo/db");
class AuditLogService {
    db = db_1.db;
    async getAuditLogs(params) {
        const { page = 1, limit = 10, search, action, userId, type, startDate, endDate, } = params;
        const skip = (page - 1) * limit;
        const where = {
            ...(search && {
                OR: [
                    { object_type: { contains: search, mode: "insensitive" } },
                    { object_id: { contains: search, mode: "insensitive" } },
                    { action: { contains: search, mode: "insensitive" } },
                ],
            }),
            ...(action && { action }),
            ...(userId && { user_id: userId }),
            ...(type === "user" && { user_id: { not: null } }),
            ...(type === "system" && { user_id: null }),
            ...(startDate &&
                endDate && {
                created_at: {
                    gte: startDate,
                    lte: endDate,
                },
            }),
        };
        const [total, logs] = await Promise.all([
            this.db.auditLogs.count({ where }),
            this.db.auditLogs.findMany({
                where,
                take: limit,
                skip,
                orderBy: { created_at: "desc" },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            }),
        ]);
        return {
            data: logs.map((log) => ({
                ...log,
                id: log.id.toString(), // Convert BigInt to string
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getAuditLogById(id) {
        const log = await this.db.auditLogs.findUnique({
            where: { id: BigInt(id) },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
        if (!log)
            return null;
        return {
            ...log,
            id: log.id.toString(),
        };
    }
    async getDistinctActions() {
        const actions = await this.db.auditLogs.groupBy({
            by: ["action"],
        });
        return actions.map((a) => a.action).filter(Boolean);
    }
}
exports.AuditLogService = AuditLogService;
