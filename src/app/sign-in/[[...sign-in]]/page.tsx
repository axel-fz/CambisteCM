/**
 * app/sign-in/[[...sign-in]]/page.tsx
 * Clerk-hosted SignIn component rendered on our own page.
 * The [[...sign-in]] catch-all segment is required by Clerk.
 */
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 via-green-600 to-emerald-500">
      <SignIn />
    </main>
  );
}
