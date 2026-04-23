/**
 * app/dashboard/page.tsx
 * Server dashboard page that loads the user's role and matching KPIs.
 */
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import KpiCard from "@/components/KpiCard";
import ChangersSection from "@/components/ChangersSection";

type Role = "echangeur" | "changeur";

interface DashboardUser {
  role: Role;
}

interface ForMeChanger {
  _id: string;
}

async function getDashboardUser(userId: string): Promise<DashboardUser | null> {
  await connectDB();
  return User.findOne({ clerkId: userId }).lean<DashboardUser | null>();
}

async function getAvailableCount() {
  const cookieStore = await cookies();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/changers/for-me`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });

    if (!response.ok) {
      return 0;
    }

    const changers = (await response.json()) as ForMeChanger[];
    return changers.length;
  } catch {
    return 0;
  }
}

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getDashboardUser(userId);
  if (!user) {
    redirect("/onboarding");
  }

  const availableCount = await getAvailableCount();
  const roleLabel = user.role === "echangeur" ? "Échangeur" : "Changeur Pro";

  const kpis =
    user.role === "echangeur"
      ? [
          {
            title: "Contacts débloqués",
            value: 12,
            subtitle: "Prises de contact directes ce mois-ci",
            icon: "lock_open",
          },
          {
            title: "Échanges réussis",
            value: 45,
            subtitle: "Transactions menées à bien récemment",
            icon: "sync_alt",
            highlight: true,
          },
          {
            title: "Note moyenne",
            value: "4.8",
            subtitle: "Basée sur les retours des derniers échanges",
            icon: "star",
          },
          {
            title: "Cambistes disponibles",
            value: availableCount,
            subtitle: "Profils disponibles selon votre besoin",
            icon: "group",
          },
        ]
      : [
          {
            title: "Revenus ce mois",
            value: "245 000 XAF",
            subtitle: "Estimation basée sur vos échanges récents",
            icon: "payments",
            highlight: true,
          },
          {
            title: "Offres actives",
            value: availableCount,
            subtitle: "Profils visibles pour les contreparties",
            icon: "storefront",
          },
          {
            title: "Contacts reçus",
            value: 18,
            subtitle: "Demandes reçues durant les derniers jours",
            icon: "call",
          },
          {
            title: "Note moyenne",
            value: "4.9",
            subtitle: "Confiance bâtie avec vos derniers partenaires",
            icon: "star",
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

      <ChangersSection role={user.role} />
    </div>
  );
}
