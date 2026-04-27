import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Listing from "@/models/Listing";
import User from "@/models/User";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/listings/[id]
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();
    const { id } = await params;

    // Validate ID format to avoid CastError
    if (id.length !== 24) {
      return Response.json({ error: "Invalid listing ID" }, { status: 400 });
    }

    const listing = await Listing.findById(id).populate("user", "name email phone neighborhood rating reviewCount");
    
    if (!listing) return Response.json({ error: "Listing not found" }, { status: 404 });
    return Response.json(listing);
  } catch (error) {
    console.error("GET /api/listings/[id] failed", error);
    return Response.json({ error: "Failed to fetch listing" }, { status: 500 });
  }
}

// PUT /api/listings/[id]
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const user = await User.findOne({ clerkId });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const { id } = await params;

    if (id.length !== 24) {
      return Response.json({ error: "Invalid listing ID" }, { status: 400 });
    }

    const body = await req.json();

    const listing = await Listing.findById(id);
    if (!listing) return Response.json({ error: "Listing not found" }, { status: 404 });

    // Ownership check
    if (listing.user.toString() !== user._id.toString()) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update allowed fields
    const updates = {
      currency: body.currency?.toUpperCase(),
      amount: body.amount || body.rate,
      rate: body.rate || body.amount,
      neighborhood: body.neighborhood,
      phone: body.phone,
      status: body.status,
      isActive: body.isActive,
    };

    const updated = await Listing.findByIdAndUpdate(id, updates, { new: true });
    return Response.json(updated);
  } catch (error) {
    return Response.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

// DELETE /api/listings/[id]
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const user = await User.findOne({ clerkId });
    const { id } = await params;

    if (id.length !== 24) {
      return Response.json({ error: "Invalid listing ID" }, { status: 400 });
    }

    const listing = await Listing.findById(id);
    if (!listing) return Response.json({ error: "Listing not found" }, { status: 404 });

    if (listing.user.toString() !== user?._id.toString()) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await Listing.findByIdAndDelete(id);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
