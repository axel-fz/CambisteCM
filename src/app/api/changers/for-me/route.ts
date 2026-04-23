/**
 * app/api/changers/for-me/route.ts
 * Returns counterpart changers for the logged-in user's role.
 */
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Changer from "@/models/Changer";
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
    const targetRole = user.role === "echangeur" ? "changeur" : "echangeur";

    const filter: Record<string, unknown> = {
      isActive: true,
      role: targetRole,
      status: { $ne: "offline" },
    };

    if (currency) {
      filter.currency = currency;
    }

    const changers = await Changer.find(filter).sort({ rating: -1 });
    return Response.json(changers);
  } catch (error) {
    console.error("GET /api/changers/for-me failed", error);
    return Response.json(
      { error: "Failed to load tailored changers" },
      { status: 500 }
    );
  }
}
