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

    const { currency, rate, neighborhood, phone } = (await req.json()) as {
      currency?: string;
      rate?: string;
      neighborhood?: string;
      phone?: string;
    };

    const initials = user.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part: string) => part[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("");

    const changer = await Changer.create({
      userId,
      name: user.name,
      initials,
      neighborhood: neighborhood ?? user.neighborhood,
      role: user.role,
      currency: currency ?? "EUR",
      rate: rate ?? "",
      phone: phone ?? user.phone,
      status: "online",
      rating: 0,
      reviewCount: 0,
      isActive: true,
    });

    return Response.json(changer, { status: 201 });
  } catch (error) {
    console.error("POST /api/changers failed", error);
    return Response.json(
      { error: "Failed to create changer listing" },
      { status: 500 }
    );
  }
}
