import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Changer from "@/models/Changer";
import Need from "@/models/Need";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const currency = req.nextUrl.searchParams.get("currency");

    if (user.role === "changeur") {
      // Pros see NEEDS from regular users
      const filter: Record<string, unknown> = {
        isActive: true,
        status: { $ne: "offline" },
      };
      if (currency) filter.currency = currency;

      const needs = await Need.find(filter).sort({ createdAt: -1 });
      // Map needs to the format expected by ChangersSection
      const mappedNeeds = needs.map((need) => ({
        ...need.toObject(),
        initials: need.name.substring(0, 2).toUpperCase(),
        rate: need.amount, // MyListingsSection uses 'rate' as label
        rating: 0, // Needs don't have ratings yet
        reviewCount: 0,
      }));
      return Response.json(mappedNeeds);
    } else {
      // Regular users see OFFERS from Pros
      const filter: Record<string, unknown> = {
        isActive: true,
        role: "changeur",
        status: { $ne: "offline" },
      };
      if (currency) filter.currency = currency;

      const changers = await Changer.find(filter).sort({ rating: -1 });
      return Response.json(changers);
    }
  } catch (error) {
    console.error("GET /api/changers/for-me failed", error);
    return Response.json(
      { error: "Failed to load tailored changers" },
      { status: 500 }
    );
  }
}
