"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coreApi_1 = __importDefault(require("./lib/coreApi"));
const midtransError_1 = __importDefault(require("./lib/midtransError"));
const snap_1 = __importDefault(require("./lib/snap"));
const MidTrans = {
    CoreApi: coreApi_1.default,
    Snap: snap_1.default,
    MidtransError: midtransError_1.default,
};
exports.default = MidTrans;
//# sourceMappingURL=index.js.map