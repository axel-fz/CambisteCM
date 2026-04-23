/**
 * app/dashboard/page.tsx
 * Main dashboard page — server component.
 * Fetches the user's role from /api/user and renders the matching KPI set.
 * Then renders a filter bar and the <ChangersTable /> client component.
 */
import { auth } from "@clerk/nextjs/server";
import KpiCard from "@/components/KpiCard";
import ChangersTable from "@/components/ChangersTable";

// KPI definitions for each role
const ECHANGEUR_KPIS = [
  { title: "Contacts Débloqués", value: "12",    subtitle: "↑ 2 ce mois",              icon: "contacts",         highlight: false },
  { title: "Échanges Réussis",   value: "45",    subtitle: "↑ 15 % vs mois préc.",     icon: "swap_horiz",       highlight: true  },
  { title: "Note Moyenne",        value: "4.8",   subtitle: "basé sur 32 avis",          icon: "star",             highlight: false },
  { title: "Dispo. Marché",       value: "Haute", subtitle: "taux moyen 655 XAF / EUR",  icon: "trending_up",      highlight: false },
];

const CHANGEUR_KPIS = [
  { title: "Revenus ce mois",  value: "—",  subtitle: "Données en cours",  icon: "payments",      highlight: false },
  { title: "Offres Actives",   value: "—",  subtitle: "Gérer vos annonces", icon: "storefront",    highlight: true  },
  { title: "Contacts Reçus",   value: "—",  subtitle: "Ce mois-ci",        icon: "mark_chat_read", highlight: false },
  { title: "Note Moyenne",     value: "—",  subtitle: "Aucun avis encore",  icon: "star",          highlight: false },
];

export default async function DashboardPage() {
  // Get the current user's Clerk ID on the server
  const { userId } = await auth();

  // Fetch the user's profile from our own API to get their role
  let role: "echangeur" | "changeur" = "echangeur"; // default
  if (userId) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/user`, {
        headers: { "x-user-id": userId }, // hint for internal call (middleware handles real auth)
        cache: "no-store",
      });
      if (res.ok) {
        const user = await res.json();
        role = user.role ?? "echangeur";
      }
    } catch {
      // Fallback to echangeur if DB not reachable
    }
  }

  const kpis = role === "changeur" ? CHANGEUR_KPIS : ECHANGEUR_KPIS;

  return (
    <div className="space-y-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
          <p className="text-slate-500 text-sm mt-0.5">Bienvenue sur CambisteCM</p>
        </div>
        <button
          id="btn-nouvelle-recherche"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-base">search</span>
          Nouvelle recherche
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        {/* Search input */}
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
          <input
            type="text"
            placeholder="Rechercher un cambiste…"
            className="text-sm text-slate-700 bg-transparent outline-none flex-1 placeholder-slate-400"
          />
        </div>

        {/* Filter selects */}
        {[
          { label: "Devise",        id: "filter-devise" },
          { label: "Quartier",      id: "filter-quartier" },
          { label: "Disponibilité", id: "filter-disponibilite" },
          { label: "Taux",          id: "filter-taux" },
        ].map(({ label, id }) => (
          <select
            key={id}
            id={id}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 bg-white outline-none"
          >
            <option value="">{label}</option>
          </select>
        ))}
      </div>

      {/* KPI cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Changers table — client component handles its own fetch */}
      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-3">Cambistes disponibles</h2>
        <ChangersTable />
      </div>
    </div>
  );
}
