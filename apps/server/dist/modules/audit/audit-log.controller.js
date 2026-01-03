"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogController = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const appResponse_1 = require("../../utils/appResponse");
const audit_log_service_1 = require("./audit-log.service");
const auditLogService = new audit_log_service_1.AuditLogService();
class AuditLogController {
    getAuditLogs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search;
        const action = req.query.action;
        const userId = req.query.user_id;
        const type = req.query.type;
        const startDate = req.query.start_date
            ? new Date(req.query.start_date)
            : undefined;
        const endDate = req.query.end_date
            ? new Date(req.query.end_date)
            : undefined;
        const result = await auditLogService.getAuditLogs({
            page,
            limit,
            search,
            action,
            userId,
            type,
            startDate,
            endDate,
        });
        new appResponse_1.AppResponse({
            res,
            data: result,
        });
    });
    getAuditLogById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const log = await auditLogService.getAuditLogById(id);
        if (!log) {
            res.status(404).json({ message: "Audit log not found" });
            return;
        }
        new appResponse_1.AppResponse({
            res,
            data: log,
        });
    });
    getActions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const actions = await auditLogService.getDistinctActions();
        new appResponse_1.AppResponse({
            res,
            data: actions,
        });
    });
}
exports.AuditLogController = AuditLogController;
