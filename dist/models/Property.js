"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const propertySchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    state: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
        type: String,
        enum: ["rent", "sale"],
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "unlisted"],
        default: "active",
    },
    beds: { type: Number, default: 0 },
    baths: { type: Number, default: 0 },
    area: { type: String },
    parking: { type: Number, default: 0 },
    images: [{ type: String }],
    features: [{ type: String }],
    coordinates: {
        lat: { type: Number },
        lng: { type: Number },
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },
    agentName: { type: String, default: "" },
    agentImage: { type: String, default: "" },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Property", propertySchema);
