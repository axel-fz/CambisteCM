import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ChangersSection from "@/components/ChangersSection";

export default async function MarketplacePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  await connectDB();
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-8"> <section className="rounded-2xl border border-slate-100  bg-white  p-6 shadow-sm transition-colors">
        <h1 className="text-3xl font-bold text-slate-800 ">Marketplace</h1> <p className="mt-2 text-sm text-slate-500 ">
          Explorez les profils disponibles et trouvez la meilleure contrepartie pour vos échanges.
        </p>
      </section>

      <ChangersSection role={user.role} />
    </div>
  );
}
