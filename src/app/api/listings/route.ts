import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Listing from "@/models/Listing";
import User from "@/models/User";

// POST /api/listings -> Create a new listing (Offer or Need)
export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findOne({ clerkId });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    
    // Enforcement: 
    // - Pro (changeur) can ONLY post OFFER
    // - Individual (echangeur) can ONLY post NEED
    const allowedType = user.role === "changeur" ? "OFFER" : "NEED";

    const listing = await Listing.create({
      user: user._id,
      type: allowedType,
      currency: body.currency?.toUpperCase(),
      amount: body.amount || body.rate, // Support both field names for flexibility
      rate: body.rate || body.amount,
      neighborhood: body.neighborhood || user.neighborhood,
      phone: body.phone || user.phone,
      status: body.status || "online",
      isActive: body.isActive !== undefined ? body.isActive : true,
      rating: user.rating,
      reviewCount: user.reviewCount,
    });

    return Response.json(listing, { status: 201 });
  } catch (error) {
    console.error("POST /api/listings failed", error);
    return Response.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
