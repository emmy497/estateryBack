"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const newsletterController_1 = require("../controllers/newsletterController");
const router = (0, express_1.Router)();
router.post("/subscribe", newsletterController_1.subscribeNewsletter);
exports.default = router;
