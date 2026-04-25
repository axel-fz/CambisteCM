import mongoose, { Schema, Document, Model } from "mongoose";

export interface INeed extends Document {
  userId: string;
  name: string;
  neighborhood: string;
  currency: string;
  amount: string;
  status: "online" | "busy" | "offline";
  phone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NeedSchema = new Schema<INeed>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    neighborhood: { type: String, default: "" },
    currency: { type: String, required: true },
    amount: { type: String, default: "" },
    status: {
      type: String,
      enum: ["online", "busy", "offline"],
      default: "online",
    },
    phone: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Need: Model<INeed> =
  (mongoose.models.Need as Model<INeed>) ||
  mongoose.model<INeed>("Need", NeedSchema);

export default Need;
