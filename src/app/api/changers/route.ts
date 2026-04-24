/**
 * app/api/changers/route.ts
 * GET  - List active changers, with optional filters.
 * POST - Create a new changer listing for the currently logged-in user.
 */
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Changer from "@/models/Changer";
import User from "@/models/User";
import {
  buildInitials,
  normalizeChangerListingInput,
} from "@/lib/changer-listing";

// GET /api/changers?currency=EUR&neighborhood=Bastos&status=online
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const currency = searchParams.get("currency");
    const neighborhood = searchParams.get("neighborhood");
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = { isActive: true };
    if (currency) filter.currency = currency;
    if (neighborhood) filter.neighborhood = neighborhood;
    if (status) filter.status = status;

    const changers = await Changer.find(filter).sort({ rating: -1 });
    return Response.json(changers);
  } catch (error) {
    console.error("GET /api/changers failed", error);
    return Response.json(
      { error: "Failed to load changers" },
      { status: 500 }
    );
  }
}

// POST /api/changers -> create a listing for the current user
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return Response.json(
        { error: "Complete onboarding first" },
        { status: 400 }
      );
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
      currency: "EUR",
      neighborhood: user.neighborhood,
      phone: user.phone,
      status: "online",
      isActive: true,
    });

    const initials = buildInitials(user.name);

    const changer = await Changer.create({
      userId,
      name: user.name,
      initials,
      neighborhood: normalizedInput.neighborhood,
      role: user.role,
      currency: normalizedInput.currency,
      rate: normalizedInput.rate,
      phone: normalizedInput.phone,
      status: normalizedInput.status,
      rating: 0,
      reviewCount: 0,
      isActive: normalizedInput.isActive,
    });

    return Response.json(changer, { status: 201 });
  } catch (error) {
    console.error("POST /api/changers failed", error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json(
      { error: "Failed to create changer listing" },
      { status: 500 }
    );
  }
}
