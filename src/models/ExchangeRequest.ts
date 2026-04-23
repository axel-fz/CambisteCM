/**
 * models/ExchangeRequest.ts
 * Mongoose model for P2P currency exchange requests.
 * Created by an échangeur who wants to swap currencies.
 */
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExchangeRequest extends Document {
  requesterId: string;           // clerkId of the user who created the request
  targetChangerId?: string;      // optional: specific changer the user contacted
  amount: number;                // amount to exchange
  fromCurrency: string;          // e.g. "EUR"
  toCurrency: string;            // e.g. "XAF"
  status: "open" | "matched" | "completed" | "cancelled";
  createdAt: Date;
}

const ExchangeRequestSchema = new Schema<IExchangeRequest>({
  requesterId:      { type: String, required: true },
  targetChangerId:  { type: String },
  amount:           { type: Number, required: true },
  fromCurrency:     { type: String, required: true },
  toCurrency:       { type: String, required: true },
  status:           {
    type: String,
    enum: ["open", "matched", "completed", "cancelled"],
    default: "open",
  },
  createdAt:        { type: Date, default: Date.now },
});

const ExchangeRequest: Model<IExchangeRequest> =
  (mongoose.models.ExchangeRequest as Model<IExchangeRequest>) ||
  mongoose.model<IExchangeRequest>("ExchangeRequest", ExchangeRequestSchema);

export default ExchangeRequest;
