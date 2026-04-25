import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import ExchangeRequest from "@/models/ExchangeRequest";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();

    // Find the request
    const request = await ExchangeRequest.findById(id);

    if (!request) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    // Only the requester can delete the request
    // Or maybe the target changer can also dismiss it? 
    // Usually "Mes demandes" refers to the owner of the view.
    // Let's check if the userId matches either requester or target changer (via their profiles)
    // For now, let's allow the requester to delete.
    if (request.requesterId !== userId) {
        // We should also check if the user is the target changer
        // But for simplicity and based on "Mes demandes", the requester owns the request entry.
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
  const { userId } = await auth();
  if (!userId) {
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

    const request = await ExchangeRequest.findById(id);
    if (!request) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    // Both requester and target changer can update status (ideally)
    // But let's verify ownership
    const myChangerProfiles = await Changer.find({ userId }).select("_id");
    const myChangerIds = myChangerProfiles.map((p) => String(p._id));
    
    const isOwner = request.requesterId === userId || 
                    (request.targetChangerId && myChangerIds.includes(String(request.targetChangerId)));

    if (!isOwner) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    request.status = status;
    await request.save();

    // If completed and rating provided, update the changer's rating
    if (status === "completed" && rating && request.targetChangerId) {
        const changer = await Changer.findById(request.targetChangerId);
        if (changer) {
            const currentTotalRating = changer.rating * changer.reviewCount;
            changer.reviewCount += 1;
            changer.rating = (currentTotalRating + rating) / changer.reviewCount;
            await changer.save();
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
