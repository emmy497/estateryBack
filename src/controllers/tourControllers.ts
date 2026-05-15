import TourRequest from "../models/TourRequest";
import Property from "../models/Property";
import { AuthRequest } from "../middleware/authMiddleware";
import { sendEmail } from "../utils/sendEmail";
import { emailTemplate, detailsBox, divider, badge } from "../utils/emailTemplate";

export const createTourRequest = async (req: AuthRequest, res: any) => {
  try {
    const { property, tourType, date, time, name, email, message } = req.body;

    if (!property || !tourType || !date || !time || !name || !email) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    const tour = await TourRequest.create({
      user: req.user!.id,
      property,
      tourType,
      date,
      time,
      name,
      email,
      message,
      status: "pending",
    });

    try {
      const propertyData = await Property.findById(property).select("title");
      const propertyTitle = propertyData?.title || "the property";

     await sendEmail(
       tour.email,
       "Your Tour Request Has Been Received – Estatery",
       emailTemplate(`
         <h2 style="margin-top:0;color:#7065F0;">Tour Request Received</h2>
         <p>Hello <strong>${tour.name}</strong>,</p>
         <p>Thank you for requesting a tour for <strong>${propertyTitle}</strong>. We've received your request and will get back to you shortly.</p>
         ${divider}
         <p style="margin-bottom:4px;color:#888;font-size:13px;">TOUR DETAILS</p>
         ${detailsBox([
           { label: "Date", value: tour.date },
           { label: "Time", value: tour.time },
           { label: "Type", value: tour.tourType },
         ])}
         <p>We'll notify you once your request has been reviewed.</p>
       `),
       tour.name,
     );
    } catch (emailError) {
      console.error("Tour request confirmation email failed:", emailError);
      return res.status(500).json({
        message:
          "Tour request submitted, but confirmation email failed to send.",
      });
    }

    res.status(201).json({
      message: "Tour request submitted successfully",
      tour,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create tour request" });
  }
};

export const getAllTours = async (req: any, res: any) => {
  try {
    const tours = await TourRequest.find()
      .populate("user", "fullName email role")
      .populate("property", "title location price images")
      .sort({ createdAt: -1 });

    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tours" });
  }
};

export const updateTourStatus = async (req: any, res: any) => {
  try {
    console.log("REQ BODY:", req.body);
    const { status, adminMessage, date, time } = req.body;

    if (!["accepted", "declined", "rescheduled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updateFields: Record<string, any> = { status, adminMessage };
    if (status === "rescheduled" && date && time) {
      updateFields.date = date;
      updateFields.time = time;
    }

    const tour = await TourRequest.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true },
    ).populate("property", "title");

    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    // Send email notification when tour is accepted

    if (status === "accepted") {
      const propertyTitle = (tour.property as any)?.title || "the property";

      try {
        console.log("ABOUT TO SEND EMAIL");
        await sendEmail(
          tour.email,
          "Your Tour Request Has Been Accepted – Estatery",
          emailTemplate(`
            <h2 style="margin-top:0;color:#7065F0;">Tour Request Accepted 🎉</h2>
            <p>Hello <strong>${tour.name}</strong>,</p>
            <p>We're pleased to inform you that your tour request for <strong>${propertyTitle}</strong> has been ${badge("Accepted", "#048120", "#DCFCE7")}.</p>
            ${divider}
            <p style="margin-bottom:4px;color:#888;font-size:13px;">TOUR DETAILS</p>
            ${detailsBox([
              { label: "Date", value: tour.date },
              { label: "Time", value: tour.time },
              { label: "Type", value: tour.tourType },
            ])}
            <p>We look forward to seeing you!</p>
          `),
          tour.name,
        );
        console.log("Email sent");
      } catch (error) {
        console.log(error);
      }
    }

    if (status === "declined") {
      const propertyTitle = (tour.property as any)?.title || "the property";

      try {
        await sendEmail(
          tour.email,
          "Update on Your Tour Request – Estatery",
          emailTemplate(`
            <h2 style="margin-top:0;color:#7065F0;">Update on Your Tour Request</h2>
            <p>Hello <strong>${tour.name}</strong>,</p>
            <p>Unfortunately, your tour request for <strong>${propertyTitle}</strong> has been ${badge("Declined", "#E60E0E", "#FFEDED")}.</p>
            ${divider}
            <p>This may be due to scheduling conflicts or property availability. You're welcome to submit a new request for a different date or time.</p>
          `),
          tour.name,
        );
      } catch (emailError) {
        console.error("Declined email failed:", emailError);
      }
    }

    if (status === "rescheduled") {
      const propertyTitle = (tour.property as any)?.title || "the property";

      try {
        await sendEmail(
          tour.email,
          "Your Tour Has Been Rescheduled – Estatery",
          emailTemplate(`
            <h2 style="margin-top:0;color:#7065F0;">Tour Rescheduled</h2>
            <p>Hello <strong>${tour.name}</strong>,</p>
            <p>Your tour for <strong>${propertyTitle}</strong> has been ${badge("Rescheduled", "#005BC4", "#E9F3FF")} to a new date and time.</p>
            ${divider}
            <p style="margin-bottom:4px;color:#888;font-size:13px;">UPDATED TOUR DETAILS</p>
            ${detailsBox([
              { label: "New Date", value: tour.date },
              { label: "New Time", value: tour.time },
              { label: "Type", value: tour.tourType },
            ])}
            <p>If you have any questions, feel free to reach out.</p>
          `),
          tour.name,
        );
        console.log("Rescheduled email sent to", tour.email);
      } catch (emailError) {
        console.error("Rescheduled email failed:", emailError);
      }
    }

    res.json({
      message: "Tour updated successfully",
      tour,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update tour" });
  }
};
