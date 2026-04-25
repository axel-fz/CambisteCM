import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

/**
 * (protected)/layout.tsx
 * Acts as a security guard for all routes within the (protected) group.
 * Ensures the user has completed onboarding before accessing the dashboard.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  await connectDB();
  const user = await User.findOne({ clerkId: userId }).lean();

  // If user doesn't exist in MongoDB or hasn't finished onboarding, force them to onboarding
  if (!user || !(user as any).onboardingComplete) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
