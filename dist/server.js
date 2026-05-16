"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const cors_1 = __importDefault(require("cors"));
const propertyRoutes_1 = __importDefault(require("./routes/propertyRoutes"));
const tourRoutes_1 = __importDefault(require("./routes/tourRoutes"));
const listingRoutes_1 = __importDefault(require("./routes/listingRoutes"));
const dns_1 = __importDefault(require("dns"));
try {
    dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
    console.log("Overrode Node DNS servers");
}
catch (e) {
    console.log("Could not set DNS servers");
}
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Allow frontend origin
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true, // only if you're using cookies/auth
}));
app.use("/api/auth", authRoutes_1.default);
app.use("/api/user", userRoutes_1.default);
app.use("/api/properties", propertyRoutes_1.default);
app.use("/api/tours", tourRoutes_1.default);
app.use("/api/listing-requests", listingRoutes_1.default);
const PORT = Number(process.env.PORT ?? 3002);
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error("MONGO_URI is not set");
    process.exit(1);
}
if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set (required for auth tokens)");
    process.exit(1);
}
mongoose_1.default
    .connect(mongoUri)
    .then(() => {
    console.log("database connected");
    app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error("Database connection error:", error instanceof Error ? error.message : error);
    process.exit(1);
});
