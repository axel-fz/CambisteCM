import mongoose, { Schema, Document, Model } from "mongoose";

export interface IListing extends Document {
  user: mongoose.Types.ObjectId;
  type: "OFFER" | "NEED";
  currency: string;
  rate?: number;
  amount?: number;
  neighborhood: string;
  phone: string;
  status: "online" | "busy" | "offline";
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["OFFER", "NEED"], required: true },
    currency: { type: String, required: true, default: "EUR" },
    rate: { type: Number },
    amount: { type: Number },
    neighborhood: { type: String, required: true },
    phone: { type: String, required: true },
    status: {
      type: String,
      enum: ["online", "busy", "offline"],
      default: "online",
    },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Listing: Model<IListing> =
  (mongoose.models.Listing as Model<IListing>) ||
  mongoose.model<IListing>("Listing", ListingSchema);

export default Listing;
