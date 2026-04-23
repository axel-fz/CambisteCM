/**
 * app/sign-up/[[...sign-up]]/page.tsx
 * Clerk-hosted SignUp component rendered on our own page.
 * After sign-up, Clerk redirects to /onboarding (set via NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL).
 */
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 via-green-600 to-emerald-500">
      <SignUp />
    </main>
  );
}
