import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Listing from "@/models/Listing";
import User from "@/models/User";

// GET /api/listings/for-me -> Marketplace items tailored to user role
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findOne({ clerkId });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const currency = searchParams.get("currency");

    // Logic: 
    // - echangeur (Individual) sees OFFERS (Pros)
    // - changeur (Pro) sees NEEDS (Individuals)
    const targetType = user.role === "changeur" ? "NEED" : "OFFER";

    const filter: Record<string, any> = {
      type: targetType,
      isActive: true,
      user: { $ne: user._id }, // Don't show own listings
    };

    if (currency) {
      filter.currency = currency.toUpperCase();
    }

    const listings = await Listing.find(filter)
      .populate("user", "name email phone neighborhood rating reviewCount")
      .sort({ rating: -1, createdAt: -1 });

    return Response.json(listings);
  } catch (error) {
    console.error("GET /api/listings/for-me failed", error);
    return Response.json({ error: "Failed to load marketplace" }, { status: 500 });
  }
}
