/**
 * models/Changer.ts
 * Mongoose model for changer listings used in the exchange marketplace.
 */
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChanger extends Document {
  userId: string;
  name: string;
  initials: string;
  neighborhood: string;
  role: "echangeur" | "changeur";
  currency: string;
  rate: string;
  status: "online" | "busy" | "offline";
  rating: number;
  reviewCount: number;
  phone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChangerSchema = new Schema<IChanger>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    initials: { type: String, required: true },
    neighborhood: { type: String, default: "" },
    role: {
      type: String,
      enum: ["echangeur", "changeur"],
      required: true,
    },
    currency: { type: String, default: "EUR" },
    rate: { type: String, default: "" },
    status: {
      type: String,
      enum: ["online", "busy", "offline"],
      default: "offline",
    },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    phone: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Changer: Model<IChanger> =
  (mongoose.models.Changer as Model<IChanger>) ||
  mongoose.model<IChanger>("Changer", ChangerSchema);

export default Changer;
