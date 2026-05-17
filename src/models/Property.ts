import mongoose, { type Document, type Schema } from "mongoose";

export interface IProperty extends Document {
  title: string;
  description: string;
  location: string;
  state: string;
  price: number;
  category: "rent" | "sale";
  status: "active" | "unlisted";
  beds: number; 
  baths: number;
  area: string;
  parking: number;
  images: string[];
  features: string[];

  coordinates: {
    lat: number;
    lng: number;
  };

  createdBy: mongoose.Types.ObjectId;

  contactPhone: string;
  contactEmail: string;
  agentName: string;
  agentImage: string;
}

const propertySchema: Schema<IProperty> = new mongoose.Schema(
  {
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },
    agentName: { type: String, default: "" },
    agentImage: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model<IProperty>("Property", propertySchema);
