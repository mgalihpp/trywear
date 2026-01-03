"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("./report.controller");
const router = (0, express_1.Router)();
const reportController = new report_controller_1.ReportController();
// Sales report
router.get("/sales", reportController.getSalesReport);
// Financial report
router.get("/financial", reportController.getFinancialReport);
// Export report (combined)
router.get("/export", reportController.getExportReport);
exports.default = router;
