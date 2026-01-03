"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consoleLogger = exports.securityLogger = exports.errorLogger = exports.requestLogger = exports.addRequestId = void 0;
const fs = __importStar(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const chalk_1 = __importDefault(require("chalk"));
const morgan_1 = __importDefault(require("morgan"));
// Membuat logs direktori jika belum ada
const logsDir = node_path_1.default.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
    console.log("Logs directory created at", logsDir);
}
// Custom format untuk logging
morgan_1.default.token("reqId", (req) => req.reqId || "Unknown");
morgan_1.default.token("userId", (req) => req.user?.id || "Anonymous");
// Membuat format log simple
const logFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" reqId=:reqId userId=:userId';
// Membuat write stream untuk menyimpan log ke file
const accessLogStream = fs.createWriteStream(node_path_1.default.join(logsDir, "access.log"), {
    flags: "a",
});
// Write stream untuk error log
const errorLogStream = fs.createWriteStream(node_path_1.default.join(logsDir, "error.log"), {
    flags: "a",
});
// Middleware untuk logging
const addRequestId = async (req, res, next) => {
    try {
        const { nanoid } = await import("nanoid");
        req.reqId = nanoid(8);
        res.setHeader("X-Request-ID", req.reqId ?? "Unknown");
        next();
    }
    catch (error) {
        console.error("Error generating request ID:", error);
        // Fallback ID
        req.reqId = Math.random().toString(36).substr(2, 8);
        res.setHeader("X-Request-ID", req.reqId);
        next();
    }
};
exports.addRequestId = addRequestId;
// Standard request logger
const requestLogger = (0, morgan_1.default)(logFormat, {
    stream: accessLogStream,
    skip: (req, _res) => req.url === "/health", // Skip health checks
});
exports.requestLogger = requestLogger;
// Error logger untuk status code 4xx dan 5xx
const errorLogger = (0, morgan_1.default)(logFormat, {
    stream: errorLogStream,
    skip: (_req, res) => res.statusCode < 400,
});
exports.errorLogger = errorLogger;
// Security logger middleware
const securityLogger = (req, _res, next) => {
    // Log suspicious patterns
    const suspiciousPatterns = [
        /script.*alert/i,
        /union.*select/i,
        /drop.*table/i,
        /<script/i,
        /javascript:/i,
    ];
    const url = req.url.toLowerCase();
    const userAgent = (req.get("User-Agent") || "").toLowerCase();
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(url) || pattern.test(userAgent)) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                type: "SECURITY_ALERT",
                ip: req.ip || req.connection.remoteAddress,
                method: req.method,
                url: req.url,
                userAgent: req.get("User-Agent"),
                reqId: req.reqId,
                pattern: pattern.source,
            };
            fs.appendFileSync(node_path_1.default.join(logsDir, "security.log"), JSON.stringify(`${logEntry}\n`));
        }
    }
    next();
};
exports.securityLogger = securityLogger;
// Console logger (custom, colored)
const consoleLogger = (0, morgan_1.default)((tokens, req, res) => {
    const status = Number(tokens.status(req, res));
    const statusColor = status >= 500
        ? chalk_1.default.red(status.toString())
        : status >= 400
            ? chalk_1.default.yellow(status.toString())
            : status >= 300
                ? chalk_1.default.cyan(status.toString())
                : chalk_1.default.green(status.toString());
    const remote = chalk_1.default.gray(tokens["remote-addr"](req, res) || "-");
    const remoteUser = chalk_1.default.gray((tokens["remote-user"] ? tokens["remote-user"](req, res) : undefined) ||
        "-");
    const date = chalk_1.default.gray(tokens.date ? tokens.date(req, res, "clf") : new Date().toUTCString());
    const method = chalk_1.default.blue(tokens.method(req, res));
    const url = chalk_1.default.bold(tokens.url(req, res));
    const httpVersion = tokens["http-version"]
        ? tokens["http-version"](req, res)
        : "-";
    const contentLength = (tokens.res ? tokens.res(req, res, "content-length") : undefined) || "-";
    const referrer = (tokens.referrer ? tokens.referrer(req, res) : undefined) || "-";
    const userAgent = (tokens["user-agent"] ? tokens["user-agent"](req, res) : undefined) ||
        "Unknown";
    const reqId = chalk_1.default.magenta(tokens.reqId ? tokens.reqId(req, res) : (req.reqId ?? "Unknown"));
    const userId = chalk_1.default.magenta(tokens.userId ? tokens.userId(req, res) : (req.user?.id ?? "Anonymous"));
    const responseTime = chalk_1.default.gray(`${tokens["response-time"](req, res)} ms`);
    // Mirror the file logFormat but with colors for console
    return `${remote} - ${remoteUser} [${date}] "${method} ${url} HTTP/${httpVersion}" ${statusColor} ${contentLength} "${referrer}" "${userAgent}" reqId=${reqId} userId=${userId} - ${responseTime}`;
});
exports.consoleLogger = consoleLogger;
