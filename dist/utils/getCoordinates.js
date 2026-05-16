"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoordinates = void 0;
const axios_1 = __importDefault(require("axios"));
const getCoordinates = async (address) => {
    try {
        const response = await axios_1.default.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
                q: address,
                format: "json",
                limit: 1,
            },
            headers: {
                "User-Agent": "your-app-name",
            },
        });
        const data = response.data;
        //  IMPORTANT: API returns an ARRAY
        if (!data || data.length === 0) {
            throw new Error("No coordinates found");
        }
        return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
        };
    }
    catch (error) {
        console.error("Geocoding API error:", error.message);
        throw new Error("Geocoding failed");
    }
};
exports.getCoordinates = getCoordinates;
