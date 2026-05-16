"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateListingRequestStatus = exports.getListingRequests = exports.createListingRequest = void 0;
const ListingRequest_1 = __importDefault(require("../models/ListingRequest"));
const sendEmail_1 = require("../utils/sendEmail");
const emailTemplate_1 = require("../utils/emailTemplate");
const createListingRequest = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, location } = req.body;
        if (!fullName || !email || !phoneNumber || !location) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const listingRequest = await ListingRequest_1.default.create({
            fullName,
            email,
            phoneNumber,
            location,
        });
        try {
            await (0, sendEmail_1.sendEmail)(listingRequest.email, "Your Listing Request Has Been Received – Estatery", (0, emailTemplate_1.emailTemplate)(`
          <h2 style="margin-top:0;color:#7065F0;">Listing Request Received</h2>
          <p>Hello <strong>${listingRequest.fullName}</strong>,</p>
          <p>Thank you for your interest in listing a property with Estatery. We've received your request and our team will review it shortly.</p>
          ${emailTemplate_1.divider}
          <p style="margin-bottom:4px;color:#888;font-size:13px;">DETAILS YOU SUBMITTED</p>
          ${(0, emailTemplate_1.detailsBox)([
                { label: "Location", value: listingRequest.location },
                { label: "Phone", value: listingRequest.phoneNumber },
            ])}
          <p>We'll notify you by email once your request has been reviewed.</p>
        `), listingRequest.fullName);
        }
        catch (emailError) {
            console.error("Listing request confirmation email failed:", emailError);
            return res.status(201).json({
                message: "Listing request submitted successfully, but the confirmation email could not be sent.",
                listingRequest,
            });
        }
        res.status(201).json({
            message: "Listing request submitted successfully",
            listingRequest,
        });
    }
    catch (error) {
        console.error("Error creating listing request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.createListingRequest = createListingRequest;
const getListingRequests = async (req, res) => {
    try {
        const listingRequests = await ListingRequest_1.default.find().sort({ createdAt: -1 });
        res.status(200).json(listingRequests);
    }
    catch (error) {
        console.error("Error fetching listing requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getListingRequests = getListingRequests;
const updateListingRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status || !["pending", "accepted", "declined"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const listingRequest = await ListingRequest_1.default.findByIdAndUpdate(id, { status }, { new: true });
        if (!listingRequest) {
            return res.status(404).json({ message: "Listing request not found" });
        }
        if (status === "accepted" || status === "declined") {
            let subject = "";
            let htmlContent = "";
            if (status === "accepted") {
                subject = "Your Listing Request Has Been Accepted – Estatery";
                htmlContent = (0, emailTemplate_1.emailTemplate)(`
          <h2 style="margin-top:0;color:#7065F0;">Great News! 🎉</h2>
          <p>Dear <strong>${listingRequest.fullName}</strong>,</p>
          <p>We're pleased to inform you that your listing request has been ${(0, emailTemplate_1.badge)("Accepted", "#048120", "#DCFCE7")}.</p>
          ${emailTemplate_1.divider}
          ${(0, emailTemplate_1.detailsBox)([{ label: "Location", value: listingRequest.location }])}
          <p>An Estatery agent will visit your location to gather the details needed to prepare and publish your listing. They will coordinate with you on timing.</p>
          <p>Thank you for choosing Estatery!</p>
        `);
            }
            else {
                subject = "Update on Your Listing Request – Estatery";
                htmlContent = (0, emailTemplate_1.emailTemplate)(`
          <h2 style="margin-top:0;color:#7065F0;">Update on Your Listing Request</h2>
          <p>Dear <strong>${listingRequest.fullName}</strong>,</p>
          <p>Thank you for submitting your listing request to Estatery. After careful review, your request has been ${(0, emailTemplate_1.badge)("Declined", "#E60E0E", "#FFEDED")} at this time.</p>
          ${emailTemplate_1.divider}
          ${(0, emailTemplate_1.detailsBox)([{ label: "Location", value: listingRequest.location }])}
          <p>We appreciate your interest and encourage you to reach out if you have any questions or would like to resubmit in the future.</p>
        `);
            }
            try {
                await (0, sendEmail_1.sendEmail)(listingRequest.email, subject, htmlContent, listingRequest.fullName);
            }
            catch (emailError) {
                console.error("Listing request status email failed:", emailError);
            }
        }
        res.status(200).json({
            message: `Listing request ${status} successfully`,
            listingRequest,
        });
    }
    catch (error) {
        console.error("Error updating listing request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateListingRequestStatus = updateListingRequestStatus;
