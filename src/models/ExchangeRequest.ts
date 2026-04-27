import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExchangeRequest extends Document {
  requester: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  status: "open" | "matched" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const ExchangeRequestSchema = new Schema<IExchangeRequest>(
  {
    requester: { type: Schema.Types.ObjectId, ref: "User", required: true },
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
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
