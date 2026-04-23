/**
 * app/api/exchange-requests/route.ts
 * GET  — List all open exchange requests (newest first).
 * POST — Create a new exchange request for the current user.
 */
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import ExchangeRequest from "@/models/ExchangeRequest";

// GET /api/exchange-requests → list open requests
export async function GET() {
  await connectDB();

  const requests = await ExchangeRequest.find({ status: "open" }).sort({
    createdAt: -1,
  });

  return Response.json(requests);
}

// POST /api/exchange-requests → create a new request
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount, fromCurrency, toCurrency, targetChangerId } = await req.json();

  if (!amount || !fromCurrency || !toCurrency) {
    return Response.json(
      { error: "amount, fromCurrency, and toCurrency are required" },
      { status: 400 }
    );
  }

  await connectDB();

  const request = await ExchangeRequest.create({
    requesterId:     userId,
    targetChangerId: targetChangerId ?? undefined,
    amount,
    fromCurrency,
    toCurrency,
    status: "open",
  });

  return Response.json(request, { status: 201 });
}
