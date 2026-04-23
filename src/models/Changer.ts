/**
 * models/Changer.ts
 * Mongoose model for cambiste (money changer) listings.
 * A Changer is created by a user who chose the "changeur" role.
 */
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChanger extends Document {
  userId: string;              // references User.clerkId
  name: string;
  initials: string;            // e.g. "JD" for "Jean Dupont"
  neighborhood: string;        // operating area
  role: "echangeur" | "changeur";
  currency: string;            // e.g. "EUR", "USD"
  rate: string;                // e.g. "655 XAF"
  status: "online" | "busy" | "offline";
  rating: number;              // average star rating (0–5)
  reviewCount: number;
  phone: string;
  isActive: boolean;           // false = soft-deleted / paused
}

const ChangerSchema = new Schema<IChanger>({
  userId:       { type: String, required: true },
  name:         { type: String, required: true },
  initials:     { type: String, required: true },
  neighborhood: { type: String, default: "" },
  role:         { type: String, enum: ["echangeur", "changeur"], default: "changeur" },
  currency:     { type: String, default: "EUR" },
  rate:         { type: String, default: "" },
  status:       { type: String, enum: ["online", "busy", "offline"], default: "offline" },
  rating:       { type: Number, default: 0 },
  reviewCount:  { type: Number, default: 0 },
  phone:        { type: String, default: "" },
  isActive:     { type: Boolean, default: true },
});

const Changer: Model<IChanger> =
  (mongoose.models.Changer as Model<IChanger>) ||
  mongoose.model<IChanger>("Changer", ChangerSchema);

export default Changer;
