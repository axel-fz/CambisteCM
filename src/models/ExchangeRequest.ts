/**
 * models/ExchangeRequest.ts
 * Mongoose model for P2P currency exchange requests.
 */
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExchangeRequest extends Document {
  requesterId: string;
  targetChangerId?: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  status: "open" | "matched" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const ExchangeRequestSchema = new Schema<IExchangeRequest>(
  {
    requesterId: { type: String, required: true },
    targetChangerId: { type: String },
    amount: { type: Number, required: true },
    fromCurrency: { type: String, required: true },
    toCurrency: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "matched", "completed", "cancelled"],
      default: "open",
    },
  },
  { timestamps: true }
);

const ExchangeRequest: Model<IExchangeRequest> =
  (mongoose.models.ExchangeRequest as Model<IExchangeRequest>) ||
  mongoose.model<IExchangeRequest>("ExchangeRequest", ExchangeRequestSchema);

export default ExchangeRequest;
