import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

/**
 * app/onboarding/page.tsx
 * Server-side entry for onboarding.
 * Checks if user is already onboarded and redirects if so.
 */
export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  await connectDB();
  const user = await User.findOne({ clerkId: userId }).lean();

  // If already onboarded, don't show this page again
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (user && (user as any).onboardingComplete) {
    redirect("/dashboard");
  }

  return <OnboardingFlow />;
}
