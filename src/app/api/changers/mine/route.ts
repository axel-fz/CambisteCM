import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Changer from "@/models/Changer";
import User from "@/models/User";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Fetch user to know their current role
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Filter by both userId and the user's current role
    const listings = await Changer.find({ 
      userId, 
      role: user.role 
    }).sort({ createdAt: -1 });

    return Response.json(listings);
  } catch (error) {
    console.error("GET /api/changers/mine failed", error);
    return Response.json(
      { error: "Failed to load your listings" },
      { status: 500 }
    );
  }
}
