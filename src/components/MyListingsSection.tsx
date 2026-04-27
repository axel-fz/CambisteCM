"use client";

import { FormEvent, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Role = "echangeur" | "changeur";
type ListingStatus = "online" | "busy" | "offline";

interface ListingItem {
  _id: string;
  currency: string;
  rate?: number;
  amount?: number;
  neighborhood: string;
  phone: string;
  status: ListingStatus;
  isActive: boolean;
}

interface ListingFormState {
  currency: string;
  rate: string;
  neighborhood: string;
  phone: string;
  status: ListingStatus;
  isActive: boolean;
}

const STATUS_OPTIONS: Array<{ value: ListingStatus; label: string }> = [
  { value: "online", label: "En ligne" },
  { value: "busy", label: "Occupe" },
  { value: "offline", label: "Hors ligne" },
];

const STATUS_STYLES = {
  online: "bg-emerald-50 text-emerald-700",
  busy: "bg-amber-50 text-amber-700",
  offline: "bg-slate-100 text-slate-500",
};

function getInitialForm(role: Role): ListingFormState {
  return {
    currency: role === "echangeur" ? "XAF" : "EUR",
    rate: "",
    neighborhood: "",
    phone: "",
    status: "online",
    isActive: true,
  };
}

/** TanStack Query fetcher */
async function fetchMyListings(): Promise<ListingItem[]> {
  const res = await fetch("/api/listings/mine", { cache: "no-store" });
  const payload = (await res.json()) as ListingItem[] | { error?: string };
  if (!res.ok || !Array.isArray(payload)) {
    throw new Error(
      !Array.isArray(payload) && (payload as { error?: string }).error
        ? (payload as { error?: string }).error
        : "Impossible de charger vos publications.",
    );
  }
  return payload;
}

export default function MyListingsSection({ role }: { role: Role }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ListingFormState>(() => getInitialForm(role));
  const [formError, setFormError] = useState<string | null>(null);

  const listingLabel = role === "changeur" ? "offre" : "besoin";
  const sectionTitle = role === "changeur" ? "Mes offres publiées" : "Mes besoins publiés";
  const currencyLabel = role === "changeur" ? "Devise proposée" : "Devise recherchée";
  const rateLabel = role === "changeur" ? "Taux" : "Détail du besoin";
  const ratePlaceholder =
    role === "changeur" ? "655 XAF / EUR" : "Besoin de 1 000 EUR contre XAF";

  // ── READ ─────────────────────────────────────────────────────────────────
  const {
    data: listings = [],
    isLoading,
  } = useQuery({
    queryKey: ["my-listings"],
    queryFn: fetchMyListings,
  });

  // ── CREATE / UPDATE ──────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (payload: ListingFormState) => {
      const url = editingId ? `/api/listings/${editingId}` : "/api/listings";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as ListingItem | { error?: string };
      if (!res.ok || !("_id" in data)) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : `Impossible d'enregistrer cette ${listingLabel}.`,
        );
      }
      return data as ListingItem;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      setEditingId(null);
      setForm(getInitialForm(role));
      setFormError(null);
    },
    onError: (err: Error) => setFormError(err.message),
  });

  // ── DELETE ───────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? `Impossible de supprimer cette ${listingLabel}.`);
      }
    },
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      if (editingId === id) {
        setEditingId(null);
        setForm(getInitialForm(role));
      }
    },
    onError: (err: Error) => setFormError(err.message),
  });

  function startEditing(listing: ListingItem) {
    setEditingId(listing._id);
    setForm({
      currency: listing.currency,
      rate: String(listing.rate ?? listing.amount ?? ""),
      neighborhood: listing.neighborhood,
      phone: listing.phone,
      status: listing.status,
      isActive: listing.isActive,
    });
    setFormError(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(getInitialForm(role));
    setFormError(null);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    saveMutation.mutate(form);
  }

  const submitting = saveMutation.isPending || deleteMutation.isPending;

  return (
    <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      {/* ── Publication form ── */}
      <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {editingId ? `Modifier mon ${listingLabel}` : `Publier un ${listingLabel}`}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {role === "changeur"
              ? "Ajoutez vos devises, votre taux et votre disponibilite pour apparaitre dans le tableau de bord des echangeurs."
              : "Publiez votre besoin pour que les changeurs voient precisement la devise recherchee et votre disponibilite."}
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {currencyLabel}
            </span>
            <input
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))}
              placeholder={role === "changeur" ? "EUR" : "USD"}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#005129]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {rateLabel}
            </span>
            <input
              value={form.rate}
              onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
              placeholder={ratePlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#005129]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Quartier</span>
            <input
              value={form.neighborhood}
              onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))}
              placeholder="Bonapriso"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#005129]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Telephone</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+237690000000"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#005129]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Statut</span>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ListingStatus }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#005129]"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-[#005129] focus:ring-[#005129]"
            />
            Visible dans le marketplace
          </label>

          {formError && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#005129] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#004322] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveMutation.isPending
                ? "Enregistrement..."
                : editingId
                  ? "Mettre a jour"
                  : "Publier"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </article>

      {/* ── Listing list ── */}
      <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-colors">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{sectionTitle}</h2>
            <p className="mt-2 text-sm text-slate-500">
              Gere ce que les contreparties voient dans leur tableau de bord.
            </p>
          </div>
          <span className="rounded-full bg-[#f7faf3] px-3 py-1 text-xs font-semibold text-[#005129]">
            {listings.length} publication{listings.length > 1 ? "s" : ""}
          </span>
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl border border-slate-100 bg-slate-50" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <p className="text-base font-semibold text-slate-800">Aucune publication pour le moment</p>
            <p className="mt-2 text-sm text-slate-500">
              Creez votre premiere {listingLabel} pour la rendre visible cote contrepartie.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {listings.map((listing) => (
              <article
                key={listing._id}
                className="rounded-2xl border border-slate-100 bg-[#f7faf3] p-5 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {currencyLabel}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-slate-800">{listing.currency}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[listing.status]}`}>
                      {STATUS_OPTIONS.find((o) => o.value === listing.status)?.label}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        listing.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {listing.isActive ? "Visible" : "Masquee"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{rateLabel}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{listing.rate ?? "Non renseigne"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Quartier</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{listing.neighborhood || "Non renseigne"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Telephone</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{listing.phone || "Non renseigne"}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => startEditing(listing)}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(listing._id)}
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
