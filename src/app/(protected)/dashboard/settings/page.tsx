import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  await connectDB();
  const user = await User.findOne({ clerkId: userId }).lean();

  if (!user) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-800">Paramètres</h1>
        <p className="mt-2 text-sm text-slate-500">
          Gérez vos informations personnelles et votre rôle sur la plateforme.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-slate-800">Mon Profil</h2>
        <SettingsForm 
            initialUser={{
                name: user.name,
                neighborhood: user.neighborhood,
                phone: user.phone,
                role: user.role,
            }} 
        />
      </section>
    </div>
  );
}
