"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./configs/server");
const server = new server_1.Server();
server.listen();
exports.default = server;
