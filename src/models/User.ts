/**
 * models/User.ts
 * Mongoose model for app users.
 * Each user maps to a Clerk account via clerkId.
 */
import mongoose, { Schema, Document, Model } from "mongoose";

// TypeScript interface for a User document
export interface IUser extends Document {
  clerkId: string;           // Clerk's unique user ID
  name: string;
  email: string;
  role: "echangeur" | "changeur";  // chosen during onboarding
  neighborhood: string;      // user's neighborhood / quartier
  phone: string;
  onboardingComplete: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  clerkId:             { type: String, required: true, unique: true },
  name:                { type: String, required: true },
  email:               { type: String, required: true },
  role:                { type: String, enum: ["echangeur", "changeur"] },
  neighborhood:        { type: String, default: "" },
  phone:               { type: String, default: "" },
  onboardingComplete:  { type: Boolean, default: false },
  createdAt:           { type: Date, default: Date.now },
});

// Guard against model re-compilation during Next.js hot-reloads
const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
