"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const tourSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    property: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Property",
        required: true,
    },
    tourType: {
        type: String,
        enum: ["in-person", "virtual"],
        required: true,
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: String,
    status: {
        type: String,
        enum: ["pending", "accepted", "declined", "rescheduled"],
        default: "pending",
    },
    adminMessage: String,
}, { timestamps: true });
exports.default = mongoose_1.default.model("TourRequest", tourSchema);
