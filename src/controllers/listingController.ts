import { Request, Response } from "express";
import ListingRequest from "../models/ListingRequest";
import { sendEmail } from "../utils/sendEmail";
import { emailTemplate, detailsBox, divider, badge } from "../utils/emailTemplate";

export const createListingRequest = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phoneNumber, location } = req.body;

    if (!fullName || !email || !phoneNumber || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const listingRequest = await ListingRequest.create({
      fullName,
      email,
      phoneNumber,
      location,
    });

    try {
      await sendEmail(
        listingRequest.email,
        "Your Listing Request Has Been Received – Estatery",
        emailTemplate(`
          <h2 style="margin-top:0;color:#7065F0;">Listing Request Received</h2>
          <p>Hello <strong>${listingRequest.fullName}</strong>,</p>
          <p>Thank you for your interest in listing a property with Estatery. We've received your request and our team will review it shortly.</p>
          ${divider}
          <p style="margin-bottom:4px;color:#888;font-size:13px;">DETAILS YOU SUBMITTED</p>
          ${detailsBox([
            { label: "Location", value: listingRequest.location },
            { label: "Phone", value: listingRequest.phoneNumber },
          ])}
          <p>We'll notify you by email once your request has been reviewed.</p>
        `),
        listingRequest.fullName,
      );
    } catch (emailError) {
      console.error("Listing request confirmation email failed:", emailError);
      return res.status(201).json({
        message:
          "Listing request submitted successfully, but the confirmation email could not be sent.",
        listingRequest,
      });
    }

    res.status(201).json({
      message: "Listing request submitted successfully",
      listingRequest,
    });
  } catch (error) {
    console.error("Error creating listing request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getListingRequests = async (req: Request, res: Response) => {
  try {
    const listingRequests = await ListingRequest.find().sort({ createdAt: -1 });
    res.status(200).json(listingRequests);
  } catch (error) {
    console.error("Error fetching listing requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateListingRequestStatus = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "accepted", "declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const listingRequest = await ListingRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!listingRequest) {
      return res.status(404).json({ message: "Listing request not found" });
    }

    if (status === "accepted" || status === "declined") {
      let subject = "";
      let htmlContent = "";

      if (status === "accepted") {
        subject = "Your Listing Request Has Been Accepted – Estatery";
        htmlContent = emailTemplate(`
          <h2 style="margin-top:0;color:#7065F0;">Great News! 🎉</h2>
          <p>Dear <strong>${listingRequest.fullName}</strong>,</p>
          <p>We're pleased to inform you that your listing request has been ${badge("Accepted", "#048120", "#DCFCE7")}.</p>
          ${divider}
          ${detailsBox([{ label: "Location", value: listingRequest.location }])}
          <p>An Estatery agent will visit your location to gather the details needed to prepare and publish your listing. They will coordinate with you on timing.</p>
          <p>Thank you for choosing Estatery!</p>
        `);
      } else {
        subject = "Update on Your Listing Request – Estatery";
        htmlContent = emailTemplate(`
          <h2 style="margin-top:0;color:#7065F0;">Update on Your Listing Request</h2>
          <p>Dear <strong>${listingRequest.fullName}</strong>,</p>
          <p>Thank you for submitting your listing request to Estatery. After careful review, your request has been ${badge("Declined", "#E60E0E", "#FFEDED")} at this time.</p>
          ${divider}
          ${detailsBox([{ label: "Location", value: listingRequest.location }])}
          <p>We appreciate your interest and encourage you to reach out if you have any questions or would like to resubmit in the future.</p>
        `);
      }

      try {
        await sendEmail(
          listingRequest.email,
          subject,
          htmlContent,
          listingRequest.fullName,
        );
      } catch (emailError) {
        console.error("Listing request status email failed:", emailError);
      }
    }

    res.status(200).json({
      message: `Listing request ${status} successfully`,
      listingRequest,
    });
  } catch (error) {
    console.error("Error updating listing request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
