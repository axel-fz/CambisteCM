import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Listing from "@/models/Listing";
import User from "@/models/User";

// GET /api/listings/mine -> Return all listings for the current user
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findOne({ clerkId });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const listings = await Listing.find({ user: user._id }).sort({ createdAt: -1 });

    return Response.json(listings);
  } catch (error) {
    console.error("GET /api/listings/mine failed", error);
    return Response.json({ error: "Failed to load your listings" }, { status: 500 });
  }
}
