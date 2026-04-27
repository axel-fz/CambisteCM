import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Listing from "@/models/Listing";
import ExchangeRequest from "@/models/ExchangeRequest";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const user = await User.findOne({ clerkId });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const role = user.role;
    
    // 1. Available counterparties count
    const targetType = role === "echangeur" ? "OFFER" : "NEED";
    const availableCount = await Listing.countDocuments({
      type: targetType,
      isActive: true,
      status: { $ne: "offline" },
    });

    // 2. Performance metrics
    let mainMetric = 0;
    let secondaryMetric = 0;
    let ratingMetric = user.rating ? user.rating.toFixed(1) : "0.0";

    if (role === "echangeur") {
      mainMetric = await ExchangeRequest.countDocuments({
        requester: user._id,
        status: { $in: ["matched", "completed"] },
      });

      secondaryMetric = await ExchangeRequest.countDocuments({
        requester: user._id,
        status: "completed",
      });
      
      ratingMetric = "N/A";
    } else {
      const myListingIds = await Listing.find({ user: user._id }).distinct("_id");
      
      mainMetric = await ExchangeRequest.countDocuments({
        listing: { $in: myListingIds },
      });

      secondaryMetric = await ExchangeRequest.countDocuments({
        listing: { $in: myListingIds },
        status: "completed",
      });
    }

    return Response.json({
      availableCount,
      mainMetric,
      secondaryMetric,
      ratingMetric,
    });
  } catch (error) {
    console.error("GET /api/stats failed", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
