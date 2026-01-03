"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const appResponse_1 = require("../../utils/appResponse");
const user_service_1 = require("./user.service");
const userService = new user_service_1.UserService();
class UserController {
    getUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search;
        const role = req.query.role;
        const result = await userService.getUsers({
            page,
            limit,
            search,
            role,
        });
        new appResponse_1.AppResponse({
            res,
            data: result,
        });
    });
    updateRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const { role } = req.body;
        if (!role) {
            res.status(400).json({ message: "Role is required" });
            return;
        }
        const result = await userService.updateUserRole(id, role);
        new appResponse_1.AppResponse({
            res,
            data: result,
            message: "User role updated successfully",
        });
    });
}
exports.UserController = UserController;
