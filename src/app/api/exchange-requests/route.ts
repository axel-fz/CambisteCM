import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Changer from "@/models/Changer";
import ExchangeRequest from "@/models/ExchangeRequest";
import User from "@/models/User";

// GET /api/exchange-requests -> list requests for the current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    let requests;
    if (user.role === "changeur") {
      // Find all changer profiles belonging to this pro
      const myChangerProfiles = await Changer.find({ userId }).select("_id");
      const myChangerIds = myChangerProfiles.map((p) => p._id);

      // Find requests targeting any of these profiles
      requests = await ExchangeRequest.find({
        targetChangerId: { $in: myChangerIds },
      }).sort({ createdAt: -1 });
    } else {
      // Regular user: requests they sent
      requests = await ExchangeRequest.find({ requesterId: userId }).sort({
        createdAt: -1,
      });
    }

    // Common enrichment: find changers for these requests
    const targetIds = requests
      .map((request) => request.targetChangerId)
      .filter((id): id is string => Boolean(id));

    const matchedChangers = targetIds.length
      ? await Changer.find({ _id: { $in: targetIds } }).lean()
      : [];

    const changerMap = new Map(
      matchedChangers.map((changer) => [String(changer._id), changer])
    );

    // If pro, also enrich with requester user info
    const requesterIds = requests.map((r) => r.requesterId);
    const requesters =
      user.role === "changeur" && requesterIds.length
        ? await User.find({ clerkId: { $in: requesterIds } }).lean()
        : [];

    const userMap = new Map(
      requesters.map((u) => [u.clerkId, u])
    );

    const enrichedRequests = requests.map((request) => ({
      ...request.toObject(),
      matchedChanger: request.targetChangerId
        ? changerMap.get(request.targetChangerId) ?? null
        : null,
      requester: userMap.get(request.requesterId) ?? null,
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
