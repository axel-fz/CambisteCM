import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Need from "@/models/Need";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const needs = await Need.find({ userId }).sort({ createdAt: -1 });
    return Response.json(needs);
  } catch (error) {
    return Response.json({ error: "Failed to load your needs" }, { status: 500 });
  }
}
