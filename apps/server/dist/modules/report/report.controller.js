"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const appResponse_1 = require("../../utils/appResponse");
const report_service_1 = require("./report.service");
const reportService = new report_service_1.ReportService();
class ReportController {
    /**
     * Get sales report
     * GET /api/reports/sales?period=daily|weekly|monthly|yearly&start_date=&end_date=
     */
    getSalesReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const period = req.query.period || "monthly";
        const startDate = req.query.start_date
            ? new Date(req.query.start_date)
            : undefined;
        const endDate = req.query.end_date
            ? new Date(req.query.end_date)
            : undefined;
        const report = await reportService.getSalesReport(period, startDate, endDate);
        new appResponse_1.AppResponse({
            res,
            data: report,
        });
    });
    /**
     * Get financial report
     * GET /api/reports/financial?period=daily|weekly|monthly|yearly&start_date=&end_date=
     */
    getFinancialReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const period = req.query.period || "monthly";
        const startDate = req.query.start_date
            ? new Date(req.query.start_date)
            : undefined;
        const endDate = req.query.end_date
            ? new Date(req.query.end_date)
            : undefined;
        const report = await reportService.getFinancialReport(period, startDate, endDate);
        new appResponse_1.AppResponse({
            res,
            data: report,
        });
    });
    /**
     * Get full report for export
     * GET /api/reports/export?period=daily|weekly|monthly|yearly&start_date=&end_date=
     */
    getExportReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const period = req.query.period || "monthly";
        const startDate = req.query.start_date
            ? new Date(req.query.start_date)
            : undefined;
        const endDate = req.query.end_date
            ? new Date(req.query.end_date)
            : undefined;
        const report = await reportService.getReportForExport(period, startDate, endDate);
        new appResponse_1.AppResponse({
            res,
            data: report,
        });
    });
}
exports.ReportController = ReportController;
