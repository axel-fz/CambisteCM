"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import RatingModal from "./RatingModal";

interface MatchedListing {
  _id: string;
  currency: string;
  rate?: number;
  amount?: number;
  neighborhood: string;
  phone: string;
  user: { name: string; phone: string; neighborhood: string };
}

interface Requester {
  _id: string;
  name: string;
  phone: string;
  neighborhood: string;
}

interface ExchangeRequestItem {
  _id: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  status: "open" | "matched" | "completed" | "cancelled";
  createdAt: string;
  listing: MatchedListing | null;
  requester?: Requester | null;
  isReceived?: boolean;
}

interface RequestsListProps {
  initialRequests: ExchangeRequestItem[];
  role: "echangeur" | "changeur";
  hideActions?: boolean;
}

const STATUS_STYLES = {
  open: "bg-amber-50 text-amber-700",
  matched: "bg-emerald-50 text-emerald-700",
  completed: "bg-sky-50 text-sky-700",
  cancelled: "bg-slate-100 text-slate-500",
};

/** API call: delete a request */
async function deleteRequest(id: string) {
  const res = await fetch(`/api/exchange-requests/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? "Une erreur est survenue lors de la suppression.");
  }
}

/** API call: update request status */
async function updateRequestStatus(id: string, status: "completed" | "cancelled", rating?: number) {
  const res = await fetch(`/api/exchange-requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, rating }),
  });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? "Une erreur est survenue.");
  }
  return res.json() as Promise<ExchangeRequestItem>;
}

export default function RequestsList({
  initialRequests,
  role,
  hideActions = false,
}: RequestsListProps) {
  const queryClient = useQueryClient();
  const [requests, setRequests] = useState(initialRequests);
  const [ratingTargetId, setRatingTargetId] = useState<string | null>(null);

  // ── DELETE ───────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: deleteRequest,
    onSuccess: (_, id) => {
      setRequests((prev) => prev.filter((r) => r._id !== id));
      void queryClient.invalidateQueries({ queryKey: ["exchange-requests"] });
    },
    onError: (err: Error) => alert(err.message),
  });

  // ── UPDATE STATUS ────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, status, rating }: { id: string; status: "completed" | "cancelled"; rating?: number }) =>
      updateRequestStatus(id, status, rating),
    onSuccess: (updated) => {
      setRequests((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      setRatingTargetId(null);
      void queryClient.invalidateQueries({ queryKey: ["exchange-requests"] });
    },
    onError: (err: Error) => alert(err.message),
  });

  const isBusy = deleteMutation.isPending || updateMutation.isPending;

  if (requests.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm transition-colors">
        <span className="material-symbols-outlined text-5xl text-slate-300">receipt_long</span>
        <h2 className="mt-4 text-lg font-semibold text-slate-800">Aucune demande pour le moment</h2>
        <p className="mt-2 text-sm text-slate-500">
          {role === "echangeur"
            ? "Creez une demande depuis le tableau de bord pour commencer un echange."
            : "Les demandes envoyees par les echangeurs apparaitront ici."}
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="grid gap-4 xl:grid-cols-2">
        {requests.map((request) => {
          const isActive = request.status === "open" || request.status === "matched";
          const canAction = isActive && !hideActions;

          return (
            <article
              key={request._id}
              className="relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              {canAction && role === "echangeur" && (
                <button
                  onClick={() => {
                    if (!confirm("Voulez-vous vraiment supprimer cette demande ?")) return;
                    deleteMutation.mutate(request._id);
                  }}
                  disabled={isBusy}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                  title="Supprimer la demande"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              )}

              <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Demande</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-800">
                    {request.amount} {request.fromCurrency} vers {request.toCurrency}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      request.isReceived ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {request.isReceived ? "Reçue" : "Envoyée"}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[request.status]}`}>
                    {request.status}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 rounded-2xl border border-slate-100 bg-[#f7faf3] p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Créée le</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {new Date(request.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {role === "echangeur" ? "Partenaire" : "Demandeur"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {request.isReceived
                      ? (request.requester?.name ?? "Inconnu")
                      : (request.listing?.user.name ?? "En attente")}
                  </p>
                </div>
              </div>

              {request.status === "matched" && (
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm font-medium text-emerald-800">
                    {request.isReceived ? "Coordonnées du demandeur" : "Contact débloqué"}
                  </p>
                  {request.isReceived && request.requester ? (
                    <>
                      <p className="mt-1 text-sm text-emerald-700">
                        {request.requester.neighborhood || "Quartier non renseigné"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-emerald-800">
                        {request.requester.phone || "Téléphone non renseigné"}
                      </p>
                    </>
                  ) : request.listing ? (
                    <>
                      <p className="mt-1 text-sm text-emerald-700">
                        {request.listing.neighborhood || request.listing.user.neighborhood}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-emerald-800">
                        {request.listing.phone || request.listing.user.phone}
                      </p>
                    </>
                  ) : null}
                </div>
              )}

              {canAction && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      if (role === "echangeur") {
                        setRatingTargetId(request._id);
                      } else {
                        updateMutation.mutate({ id: request._id, status: "completed" });
                      }
                    }}
                    disabled={isBusy}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#005129] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004322] disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Terminer
                  </button>
                  <button
                    onClick={() => updateMutation.mutate({ id: request._id, status: "cancelled" })}
                    disabled={isBusy}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    Annuler
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {ratingTargetId && (
        <RatingModal
          onClose={() =>
            updateMutation.mutate({ id: ratingTargetId, status: "completed" })
          }
          onSubmit={(rating) =>
            updateMutation.mutate({ id: ratingTargetId, status: "completed", rating })
          }
        />
      )}
    </>
  );
}
