import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Changer from "@/models/Changer";
import { normalizeChangerListingInput } from "@/lib/changer-listing";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

async function getOwnedListing(id: string, userId: string) {
  const listing = await Changer.findById(id);

  if (!listing) {
    return { error: Response.json({ error: "Listing not found" }, { status: 404 }) };
  }

  if (listing.userId !== userId) {
    return { error: Response.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { listing };
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { id } = await params;
    const owned = await getOwnedListing(id, userId);
    if ("error" in owned) {
      return owned.error;
    }

    const body = (await req.json()) as {
      currency?: string;
      rate?: string;
      neighborhood?: string;
      phone?: string;
      status?: "online" | "busy" | "offline";
      isActive?: boolean;
    };

    const normalizedInput = normalizeChangerListingInput(body, {
      currency: owned.listing.currency,
      rate: owned.listing.rate,
      neighborhood: owned.listing.neighborhood,
      phone: owned.listing.phone,
      status: owned.listing.status,
      isActive: owned.listing.isActive,
    });

    owned.listing.currency = normalizedInput.currency;
    owned.listing.rate = normalizedInput.rate;
    owned.listing.neighborhood = normalizedInput.neighborhood;
    owned.listing.phone = normalizedInput.phone;
    owned.listing.status = normalizedInput.status;
    owned.listing.isActive = normalizedInput.isActive;

    await owned.listing.save();

    return Response.json(owned.listing);
  } catch (error) {
    console.error("PUT /api/changers/[id] failed", error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { id } = await params;
    const owned = await getOwnedListing(id, userId);
    if ("error" in owned) {
      return owned.error;
    }

    await owned.listing.deleteOne();

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/changers/[id] failed", error);
    return Response.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
