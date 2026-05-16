"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProperty = exports.updatePropertyStatus = exports.getPropertyById = exports.getProperties = exports.createProperty = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const Property_1 = __importDefault(require("../models/Property"));
const getCoordinates_1 = require("../utils/getCoordinates");
const createProperty = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No images uploaded" });
        }
        // 1. Upload images to Cloudinary
        const uploadResults = await Promise.all(files.map((file) => {
            return new Promise((resolve, reject) => {
                cloudinary_1.default.uploader
                    .upload_stream({ folder: "properties" }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                })
                    .end(file.buffer);
            });
        }));
        const imageUrls = uploadResults.map((r) => r.secure_url);
        // 2. Prepare property data (NO coordinates yet)
        const propertyData = {
            ...req.body,
            price: Number(req.body.price),
            beds: Number(req.body.beds),
            baths: Number(req.body.baths),
            area: Number(req.body.area),
            parking: Number(req.body.parking),
            features: req.body.features ? JSON.parse(req.body.features) : [],
            images: imageUrls,
            coordinates: null, //  temporarily null
        };
        // 3. Save property FIRST (fast response)
        const property = await Property_1.default.create(propertyData);
        // 4.  Background geocoding (NON-BLOCKING)
        const fullAddress = `${req.body.location}, ${req.body.state}, Nigeria`;
        (0, getCoordinates_1.getCoordinates)(fullAddress)
            .then(async (coords) => {
            await Property_1.default.findByIdAndUpdate(property._id, {
                coordinates: coords,
            });
            console.log("Coordinates updated in background");
        })
            .catch((err) => {
            console.warn("Background geocoding failed:", err.message);
        });
        // 5. Respond immediately
        return res.status(201).json({
            message: "Property created successfully",
            property,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "could not create property",
            error: err.message,
        });
    }
};
exports.createProperty = createProperty;
const getProperties = async (req, res) => {
    try {
        const { search, type, status } = req.query;
        let filter = {};
        //  Search (title OR location)
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
            ];
        }
        // 🏷 Property type
        if (type && type !== "all") {
            filter.category = type;
        }
        //  Status
        if (status && status !== "all") {
            filter.status = status;
        }
        const properties = await Property_1.default.find(filter).sort({ createdAt: -1 });
        res.json(properties);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching properties" });
    }
};
exports.getProperties = getProperties;
const getPropertyById = async (req, res) => {
    try {
        const property = await Property_1.default.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        res.json(property);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getPropertyById = getPropertyById;
const updatePropertyStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !["active", "unlisted"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const property = await Property_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        res.json({
            message: "Property status updated",
            property,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update property status" });
    }
};
exports.updatePropertyStatus = updatePropertyStatus;
const updateProperty = async (req, res) => {
    try {
        const body = req.body;
        const allowedKeys = [
            "title",
            "description",
            "location",
            "state",
            "price",
            "category",
            "beds",
            "baths",
            "area",
            "parking",
            "features",
            "contactPhone",
            "contactEmail",
        ];
        const updates = {};
        for (const key of allowedKeys) {
            if (body[key] !== undefined && body[key] !== null) {
                updates[key] = body[key];
            }
        }
        if (updates.price !== undefined) {
            updates.price = Number(updates.price);
        }
        if (updates.beds !== undefined) {
            updates.beds = Number(updates.beds);
        }
        if (updates.baths !== undefined) {
            updates.baths = Number(updates.baths);
        }
        if (updates.parking !== undefined) {
            updates.parking = Number(updates.parking);
        }
        if (typeof updates.features === "string") {
            try {
                updates.features = JSON.parse(updates.features);
            }
            catch {
                return res.status(400).json({ message: "Invalid features format" });
            }
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }
        const property = await Property_1.default.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        });
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        res.json({
            message: "Property updated",
            property,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update property" });
    }
};
exports.updateProperty = updateProperty;
