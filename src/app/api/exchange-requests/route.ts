import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Listing from "@/models/Listing";
import ExchangeRequest from "@/models/ExchangeRequest";
import User from "@/models/User";

// GET /api/exchange-requests -> list requests for the current user (sent AND received)
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findOne({ clerkId });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Find my own listing IDs (to find requests received)
    const myListingIds = await Listing.find({ user: user._id }).distinct("_id");

    // 2. Find requests where I am either the requester OR the target of a listing
    const requests = await ExchangeRequest.find({
      $or: [{ requester: user._id }, { listing: { $in: myListingIds } }],
    })
      .populate("requester", "name email phone neighborhood")
      .populate({
        path: "listing",
        populate: {
          path: "user",
          select: "name phone neighborhood rating reviewCount",
        },
      })
      .select("+type") // Include type field in response
      .sort({ createdAt: -1 });

    // Mark each request as "received" or "sent" for the frontend
    const enrichedRequests = requests.map((req) => {
      const isReceived = myListingIds.some(
        (id) => id.toString() === req.listing._id.toString(),
      );
      return {
        ...req.toObject(),
        isReceived,
      };
    });

    return Response.json(enrichedRequests);
  } catch (error) {
    console.error("GET /api/exchange-requests failed", error);
    return Response.json(
      { error: "Failed to load exchange requests" },
      { status: 500 },
    );
  }
}

// POST /api/exchange-requests -> create a new request
export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount, fromCurrency, toCurrency, listingId } =
    (await req.json()) as {
      amount?: number;
      fromCurrency?: string;
      toCurrency?: string;
      listingId?: string;
    };

  if (!amount || !fromCurrency || !toCurrency || !listingId) {
    return Response.json(
      { error: "amount, fromCurrency, toCurrency, and listingId are required" },
      { status: 400 },
    );
  }

  try {
    await connectDB();

    const user = await User.findOne({ clerkId });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    const request = await ExchangeRequest.create({
      requester: user._id,
      listing: listingId,
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
      { status: 500 },
    );
  }
}
