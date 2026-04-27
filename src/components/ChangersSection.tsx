/**
 * components/ChangersSection.tsx
 * Client dashboard section that loads counterpart changers and displays them as cards.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import ContactModal, { ContactChanger } from "@/components/ContactModal";

type Role = "echangeur" | "changeur";

interface ChangersSectionProps {
  role: Role;
}

type ChangerCardData = ContactChanger;

const STATUS_STYLES = {
  online: "bg-emerald-50 text-emerald-700",
  busy: "bg-amber-50 text-amber-700",
  offline: "bg-slate-100 text-slate-500",
};

const STATUS_LABELS = {
  online: "En ligne",
  busy: "Occupé",
  offline: "Hors ligne",
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="animate-pulse">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-3 w-20 rounded bg-slate-200" />
            </div>
          </div>
          <div className="h-6 w-20 rounded-full bg-slate-200" />
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="h-4 w-24 rounded bg-slate-200" />
        </div>
        <div className="mt-6 h-11 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

export default function ChangersSection({ role }: ChangersSectionProps) {
  const [changers, setChangers] = useState<ChangerCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currency, setCurrency] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [selectedChanger, setSelectedChanger] = useState<ChangerCardData | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    async function loadChangers() {
      setLoading(true);
      setError(null);

      try {
        const query = currency
          ? `?currency=${encodeURIComponent(currency)}`
          : "";
        const response = await fetch(`/api/listings/for-me${query}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Impossible de charger les profils disponibles.");
        }

        const data = (await response.json()) as ChangerCardData[];
        if (!cancelled) {
          setChangers(data);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Impossible de charger les profils disponibles."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadChangers();

    return () => {
      cancelled = true;
    };
  }, [currency]);

  const filteredChangers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedNeighborhood = neighborhood.trim().toLowerCase();

    return changers.filter((changer) => {
      const currentNeighborhood = (changer.neighborhood || changer.user.neighborhood || "").toLowerCase();
      const matchesNeighborhood = normalizedNeighborhood
        ? currentNeighborhood.includes(normalizedNeighborhood)
        : true;

      const matchesSearch = normalizedSearch
        ? [
            changer.user.name,
            changer.neighborhood || changer.user.neighborhood,
            changer.currency,
            changer.rate || changer.amount,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        : true;

      return matchesNeighborhood && matchesSearch;
    });
  }, [changers, neighborhood, search]);

  const sectionTitle =
    role === "echangeur"
      ? "Changeurs Pro disponibles"
      : "Échangeurs disponibles";
  const currencyLabel =
    role === "echangeur" ? "Devise proposée" : "Devise recherchée";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-slate-800">{sectionTitle}</h2>
        <p className="text-sm text-slate-500">
          Prenez contact directement avec la contrepartie qui correspond à votre besoin.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
            <span className="material-symbols-outlined text-slate-400">search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un profil ou un quartier"
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
            <span className="material-symbols-outlined text-slate-400">
              currency_exchange
            </span>
            <input
              value={currency}
              onChange={(event) => setCurrency(event.target.value.toUpperCase())}
              placeholder="EUR, USD, XAF"
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
            <span className="material-symbols-outlined text-slate-400">location_on</span>
            <input
              value={neighborhood}
              onChange={(event) => setNeighborhood(event.target.value)}
              placeholder="Quartier"
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      ) : filteredChangers.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300">
            group
          </span>
          <h3 className="mt-4 text-lg font-semibold text-slate-800">
            Aucun cambiste disponible pour le moment.
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Revenez plus tard ou ajustez vos filtres.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredChangers.map((changer) => (
            <article
              key={changer._id}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#005129] text-sm font-bold text-white">
                    {changer.user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {changer.user.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {changer.neighborhood || changer.user.neighborhood || "Quartier non renseigné"}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[changer.status]}`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {STATUS_LABELS[changer.status]}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {currencyLabel}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {changer.currency}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Taux
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {changer.rate || changer.amount || "Non communiqué"}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1 text-sm text-slate-500">
                  <span className="material-symbols-outlined text-[18px] text-amber-500">
                    star
                  </span>
                  {changer.user.rating.toFixed(1)} ({changer.user.reviewCount})
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedChanger(changer)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f59e0b] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
              >
                <span className="material-symbols-outlined text-[18px]">call</span>
                Contacter
              </button>
            </article>
          ))}
        </div>
      )}

      {selectedChanger ? (
        <ContactModal
          changer={selectedChanger}
          role={role}
          onClose={() => setSelectedChanger(null)}
        />
      ) : null}
    </section>
  );
}

