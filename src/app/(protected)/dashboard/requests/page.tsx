import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import RequestsList from "@/components/RequestsList";

async function getRequests() {
  const cookieStore = await cookies();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/exchange-requests`, {
    headers: { Cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  return await response.json();
}

async function getUser(userId: string) {
    await connectDB();
    return User.findOne({ clerkId: userId });
}

export default async function RequestsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUser(userId);
  if (!user) {
      redirect("/onboarding");
  }

  const requests = await getRequests();
  const isPro = user.role === "changeur";

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-800">
          {isPro ? "Demandes reçues" : "Mes demandes"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {isPro 
            ? "Consultez les demandes envoyées par les échangeurs intéressés par vos offres."
            : "Suivez les demandes d'échange que vous avez créées et les contacts débloqués."}
        </p>
      </section>

      <RequestsList initialRequests={requests} role={user.role} />
    </div>
  );
}
