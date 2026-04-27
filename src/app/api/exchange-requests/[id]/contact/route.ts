import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Listing from "@/models/Listing";
import ExchangeRequest from "@/models/ExchangeRequest";
import User from "@/models/User";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = (await req.json()) as { listingId?: string };
  if (!listingId) {
    return Response.json(
      { error: "listingId is required" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const user = await User.findOne({ clerkId });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const { id } = await context.params;
    const exchangeRequest = await ExchangeRequest.findById(id);

    if (!exchangeRequest) {
      return Response.json(
        { error: "Exchange request not found" },
        { status: 404 }
      );
    }

    if (exchangeRequest.requester.toString() !== user._id.toString()) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const listing = await Listing.findById(listingId).populate("user", "phone");
    if (!listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    exchangeRequest.status = "matched";
    exchangeRequest.listing = listingId as any;
    await exchangeRequest.save();

    return Response.json({
      request: exchangeRequest,
      phone: listing.phone || (listing.user as any).phone,
    });
  } catch (error) {
    console.error("POST /api/exchange-requests/[id]/contact failed", error);
    return Response.json(
      { error: "Failed to connect both parties" },
      { status: 500 }
    );
  }
}
