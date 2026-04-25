/**
 * app/dashboard/page.tsx
 * Server dashboard page that loads the user's role and matching KPIs.
 */
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Changer from "@/models/Changer";
import ExchangeRequest from "@/models/ExchangeRequest";
import KpiCard from "@/components/KpiCard";
import ChangersSection from "@/components/ChangersSection";
import MyListingsSection from "@/components/MyListingsSection";

type Role = "echangeur" | "changeur";

async function getDashboardData(userId: string, role: Role) {
  await connectDB();
  
  // 1. Available counterparties count
  const targetRole = role === "echangeur" ? "changeur" : "echangeur";
  const availableCount = await Changer.countDocuments({
    role: targetRole,
    isActive: true,
    status: { $ne: "offline" },
  });

  // 2. Performance metrics
  let mainMetric = 0;
  let secondaryMetric = 0;
  let ratingMetric = "0.0";

  if (role === "echangeur") {
    // Contacts unlocked (matched or beyond)
    mainMetric = await ExchangeRequest.countDocuments({
      requesterId: userId,
      status: { $in: ["matched", "completed"] },
    });

    // Successful exchanges
    secondaryMetric = await ExchangeRequest.countDocuments({
      requesterId: userId,
      status: "completed",
    });
    
    ratingMetric = "N/A";
  } else {
    // For Pros: Requests received
    const myProfiles = await Changer.find({ userId }).select("_id rating");
    const myIds = myProfiles.map((p) => p._id);
    
    mainMetric = await ExchangeRequest.countDocuments({
      targetChangerId: { $in: myIds },
    });

    secondaryMetric = await ExchangeRequest.countDocuments({
      targetChangerId: { $in: myIds },
      status: "completed",
    });

    const totalRating = myProfiles.reduce((acc, p) => acc + p.rating, 0);
    ratingMetric = myProfiles.length > 0 ? (totalRating / myProfiles.length).toFixed(1) : "0.0";
  }

  return { availableCount, mainMetric, secondaryMetric, ratingMetric };
}

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  await connectDB();
  const user = await User.findOne({ clerkId: userId }).lean();
  if (!user) {
    redirect("/onboarding");
  }

  const role = user.role as Role;
  const { availableCount, mainMetric, secondaryMetric, ratingMetric } = await getDashboardData(userId, role);
  
  const roleLabel = role === "echangeur" ? "Échangeur" : "Changeur Pro";

  const kpis =
    role === "echangeur"
      ? [
          {
            title: "Contacts débloqués",
            value: mainMetric,
            subtitle: "Prises de contact directes",
            icon: "lock_open",
          },
          {
            title: "Échanges réussis",
            value: secondaryMetric,
            subtitle: "Transactions terminées",
            icon: "sync_alt",
            highlight: true,
          },
          {
            title: "Cambistes actifs",
            value: availableCount,
            subtitle: "Profils prêts à échanger",
            icon: "group",
          },
          {
            title: "Sécurité",
            value: "100%",
            subtitle: "Transactions protégées",
            icon: "shield",
          },
        ]
      : [
          {
            title: "Demandes reçues",
            value: mainMetric,
            subtitle: "Intérêts de clients potentiels",
            icon: "call",
          },
          {
            title: "Échanges finalisés",
            value: secondaryMetric,
            subtitle: "Volume d'activité total",
            icon: "payments",
            highlight: true,
          },
          {
            title: "Note moyenne",
            value: ratingMetric,
            subtitle: "Basée sur les avis clients",
            icon: "star",
          },
          {
            title: "Visibilité",
            value: availableCount > 0 ? "Active" : "Basse",
            subtitle: "Statut de vos offres",
            icon: "visibility",
          },
        ];

  return (
    <div className="relative min-h-screen space-y-10 pb-10">
      {/* Background Decor */}
      <div className="pointer-events-none absolute -top-24 right-0 -z-10 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-amber-50/50 blur-3xl" />

      <header className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/60 p-8 shadow-xl backdrop-blur-xl md:p-10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#005129]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              {roleLabel} Connecté
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Tableau de bord
            </h1>
            <p className="mt-4 max-w-xl text-lg font-medium text-slate-500/80 leading-relaxed">
              {role === "echangeur" 
                ? "Gérez vos besoins de devises et connectez-vous aux meilleurs cambistes en temps réel."
                : "Optimisez votre visibilité et gérez vos demandes d'échanges reçues avec efficacité."}
            </p>
          </div>

          <div className="hidden xl:block">
             <div className="flex items-center gap-4 rounded-3xl border border-white/60 bg-white/40 p-2 pr-6 shadow-sm backdrop-blur-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#005129] text-white shadow-lg shadow-emerald-900/20">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight text-slate-400">Statut Compte</p>
                  <p className="text-sm font-bold text-slate-700">Profil Vérifié</p>
                </div>
             </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </section>

      <div className="grid gap-10 lg:grid-cols-[1fr_auto]">
        <div className="space-y-10">
          <section className="group relative overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/60 p-1 shadow-2xl backdrop-blur-2xl transition-all hover:shadow-emerald-900/5">
             <div className="p-8 md:p-10">
                <MyListingsSection role={role} />
             </div>
          </section>

          <section className="group relative overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/60 p-1 shadow-2xl backdrop-blur-2xl transition-all hover:shadow-emerald-900/5">
             <div className="p-8 md:p-10">
                <ChangersSection role={role} />
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
