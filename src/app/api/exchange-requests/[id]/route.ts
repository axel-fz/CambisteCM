import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Listing from "@/models/Listing";
import ExchangeRequest from "@/models/ExchangeRequest";
import User from "@/models/User";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();

    const user = await User.findOne({ clerkId });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const request = await ExchangeRequest.findById(id);

    if (!request) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.requester.toString() !== user._id.toString()) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await ExchangeRequest.findByIdAndDelete(id);

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/exchange-requests/[id] failed", error);
    return Response.json(
      { error: "Failed to delete exchange request" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status, rating } = (await req.json()) as {
    status?: "completed" | "cancelled";
    rating?: number;
  };

  if (!status) {
    return Response.json({ error: "status is required" }, { status: 400 });
  }

  try {
    await connectDB();

    const user = await User.findOne({ clerkId });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const request = await ExchangeRequest.findById(id).populate("listing");
    if (!request) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    const listing = request.listing as any;
    
    // Ownership check
    const isOwner = request.requester.toString() === user._id.toString() || 
                    (listing && listing.user.toString() === user._id.toString());

    if (!isOwner) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    request.status = status;
    await request.save();

    // If completed and rating provided, update the target user's rating
    if (status === "completed" && rating && listing) {
        const targetUser = await User.findById(listing.user);
        if (targetUser) {
            const currentTotalRating = (targetUser.rating || 0) * (targetUser.reviewCount || 0);
            targetUser.reviewCount = (targetUser.reviewCount || 0) + 1;
            targetUser.rating = (currentTotalRating + rating) / targetUser.reviewCount;
            await targetUser.save();
            
            // Also update the listing's cached rating
            listing.rating = targetUser.rating;
            listing.reviewCount = targetUser.reviewCount;
            await listing.save();
        }
    }

    return Response.json(request);
  } catch (error) {
    console.error("PATCH /api/exchange-requests/[id] failed", error);
    return Response.json(
      { error: "Failed to update exchange request" },
      { status: 500 }
    );
  }
}
