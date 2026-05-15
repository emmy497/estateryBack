import mongoose, { Schema, Document } from "mongoose";

export interface IListingRequest extends Document {
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}

const listingRequestSchema = new Schema<IListingRequest>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const ListingRequest = mongoose.model<IListingRequest>(
  "ListingRequest",
  listingRequestSchema,
);

export default ListingRequest;
