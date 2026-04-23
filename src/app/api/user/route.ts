/**
 * app/api/user/route.ts
 * GET  - Returns the current user's profile from MongoDB (by clerkId).
 * POST - Creates or updates the user record; sets role from onboarding.
 */
import { NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

type Role = "echangeur" | "changeur";

function isValidRole(role: unknown): role is Role {
  return role === "echangeur" || role === "changeur";
}

// GET /api/user -> return logged-in user's profile
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error("GET /api/user failed", error);
    return Response.json(
      { error: "Failed to load user profile" },
      { status: 500 }
    );
  }
}

// POST /api/user -> create or update user with role from onboarding
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return Response.json({ error: "Clerk user not found" }, { status: 401 });
  }

  const { role, neighborhood, phone } = (await req.json()) as {
    role?: unknown;
    neighborhood?: string;
    phone?: string;
  };

  if (!isValidRole(role)) {
    return Response.json(
      { error: "role must be either 'echangeur' or 'changeur'" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        clerkId: userId,
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        role,
        neighborhood: neighborhood ?? "",
        phone: phone ?? "",
        onboardingComplete: true,
      },
      { upsert: true, new: true }
    );

    return Response.json(user, { status: 201 });
  } catch (error) {
    console.error("POST /api/user failed", error);
    return Response.json(
      { error: "Failed to save user profile" },
      { status: 500 }
    );
  }
}
