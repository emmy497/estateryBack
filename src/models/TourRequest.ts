import mongoose, { type Document, type Schema } from "mongoose";

export interface ITourRequest extends Document {
  user: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;

  tourType: "in-person" | "virtual";

  date: string;
  time: string;

  name: string;
  email: string;
  message?: string;

  status: "pending" | "accepted" | "declined" | "rescheduled";
  adminMessage?: string;
}

const tourSchema: Schema<ITourRequest> = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  { timestamps: true },
);

export default mongoose.model<ITourRequest>("TourRequest", tourSchema);
