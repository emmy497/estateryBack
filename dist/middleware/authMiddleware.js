"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.Protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Protect = (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "Not authorized" });
    }
    try {
        token = token.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Token failed" });
    }
};
exports.Protect = Protect;
const adminOnly = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin only" });
    }
    next();
};
exports.adminOnly = adminOnly;
