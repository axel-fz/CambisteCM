import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Need from "@/models/Need";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const currency = searchParams.get("currency");

    const filter: Record<string, unknown> = { isActive: true };
    if (currency) filter.currency = currency;

    const needs = await Need.find(filter).sort({ createdAt: -1 });
    return Response.json(needs);
  } catch (error) {
    return Response.json({ error: "Failed to load needs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const need = await Need.create({
      userId,
      name: user.name,
      neighborhood: body.neighborhood || user.neighborhood,
      currency: body.currency,
      amount: body.rate || body.amount, // MyListingsSection uses 'rate' as label
      phone: body.phone || user.phone,
      status: body.status || "online",
      isActive: body.isActive ?? true,
    });

    return Response.json(need, { status: 201 });
  } catch (error) {
    return Response.json({ error: "Failed to create need" }, { status: 500 });
  }
}
