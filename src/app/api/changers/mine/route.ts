import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Changer from "@/models/Changer";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const listings = await Changer.find({ userId }).sort({ createdAt: -1 });
    return Response.json(listings);
  } catch (error) {
    console.error("GET /api/changers/mine failed", error);
    return Response.json(
      { error: "Failed to load your listings" },
      { status: 500 }
    );
  }
}
