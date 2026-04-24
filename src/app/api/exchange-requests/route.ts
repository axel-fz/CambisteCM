/**
 * app/api/exchange-requests/route.ts
 * GET  - List exchange requests for the current user.
 * POST - Create a new exchange request for the current user.
 */
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Changer from "@/models/Changer";
import ExchangeRequest from "@/models/ExchangeRequest";

// GET /api/exchange-requests -> list requests for the current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const requests = await ExchangeRequest.find({ requesterId: userId }).sort({
      createdAt: -1,
    });

    const targetIds = requests
      .map((request) => request.targetChangerId)
      .filter((id): id is string => Boolean(id));

    const matchedChangers = targetIds.length
      ? await Changer.find({ _id: { $in: targetIds } }).lean()
      : [];

    const changerMap = new Map(
      matchedChangers.map((changer) => [String(changer._id), changer])
    );

    const enrichedRequests = requests.map((request) => ({
      ...request.toObject(),
      matchedChanger: request.targetChangerId
        ? changerMap.get(request.targetChangerId) ?? null
        : null,
    }));

    return Response.json(enrichedRequests);
  } catch (error) {
    console.error("GET /api/exchange-requests failed", error);
    return Response.json(
      { error: "Failed to load exchange requests" },
      { status: 500 }
    );
  }
}

// POST /api/exchange-requests -> create a new request
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount, fromCurrency, toCurrency, targetChangerId } = (await req.json()) as {
    amount?: number;
    fromCurrency?: string;
    toCurrency?: string;
    targetChangerId?: string;
  };

  if (!amount || !fromCurrency || !toCurrency) {
    return Response.json(
      { error: "amount, fromCurrency, and toCurrency are required" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const request = await ExchangeRequest.create({
      requesterId: userId,
      targetChangerId: targetChangerId ?? undefined,
      amount,
      fromCurrency,
      toCurrency,
      status: "open",
    });

    return Response.json(request, { status: 201 });
  } catch (error) {
    console.error("POST /api/exchange-requests failed", error);
    return Response.json(
      { error: "Failed to create exchange request" },
      { status: 500 }
    );
  }
}
