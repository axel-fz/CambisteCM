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
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#005129]">{roleLabel}</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-800">
              Tableau de bord
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Découvrez les profils adaptés à votre besoin et prenez contact immédiatement.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-[#f7faf3] px-4 py-2 text-sm font-medium text-slate-500">
            <span className="material-symbols-outlined text-[18px] text-[#005129]">
              verified_user
            </span>
            Espace sécurisé CambisteCM
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </section>

      <MyListingsSection role={user.role} />

      <ChangersSection role={user.role} />
    </div>
  );
}
