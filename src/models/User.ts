/**
 * models/User.ts
 * Mongoose model for app users.
 * Each user maps to a Clerk account via clerkId.
 */
import mongoose, { Schema, Document, Model } from "mongoose";

// TypeScript interface for a User document
export interface IUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  role: "echangeur" | "changeur";
  neighborhood: string;
  phone: string;
  onboardingComplete: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: {
      type: String,
      enum: ["echangeur", "changeur"],
      required: true,
    },
    neighborhood: { type: String, default: "" },
    phone: { type: String, default: "" },
    onboardingComplete: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Guard against model re-compilation during Next.js hot-reloads
const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
