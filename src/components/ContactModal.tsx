/**
 * components/ContactModal.tsx
 * Contact modal that creates an exchange request before revealing contact details.
 */
"use client";

import { useEffect, useMemo, useState } from "react";

type Role = "echangeur" | "changeur";

export interface ContactChanger {
  _id: string;
  name: string;
  initials: string;
  neighborhood: string;
  currency: string;
  rate: string;
  role?: Role;
  status: "online" | "busy" | "offline";
  rating: number;
  reviewCount: number;
  phone: string;
}

interface ContactModalProps {
  changer: ContactChanger | null;
  role: Role;
  onClose: () => void;
}

interface CreatedRequest {
  _id: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  status: "open" | "matched" | "completed" | "cancelled";
}

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

function formatWhatsAppPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function getDefaultCurrencies(role: Role, changer: ContactChanger) {
  if (role === "echangeur") {
    return {
      fromCurrency: "XAF",
      toCurrency: changer.currency === "XAF" ? "" : changer.currency,
    };
  }

  return {
    fromCurrency: "",
    toCurrency: "XAF",
  };
}

export default function ContactModal({
  changer,
  role,
  onClose,
}: ContactModalProps) {
  const defaultCurrencies = useMemo(
    () => getDefaultCurrencies(role, changer),
    [changer, role]
  );

  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState(defaultCurrencies.fromCurrency);
  const [toCurrency, setToCurrency] = useState(defaultCurrencies.toCurrency);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRequest, setCreatedRequest] = useState<CreatedRequest | null>(null);
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changer, onClose, role]);

  const counterpartLabel = useMemo(() => {
    if (!changer?.role) {
      return role === "echangeur" ? "Changeur Pro" : "Échangeur";
    }

    return changer.role === "changeur" ? "Changeur Pro" : "Échangeur";
  }, [changer?.role, role]);

  if (!changer) {
    return null;
  }

  const phone = contactPhone || changer.phone || "Non renseigné";
  const whatsappPhone = formatWhatsAppPhone(contactPhone || changer.phone);
  const requestCurrencyLabel =
    role === "echangeur" ? "Devise proposée" : "Devise recherchée";

  async function handleSubmit() {
    if (!amount || !fromCurrency || !toCurrency) {
      setError("Veuillez renseigner le montant et les deux devises.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const createResponse = await fetch("/api/exchange-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          fromCurrency,
          toCurrency,
          targetChangerId: changer._id,
        }),
      });

      const createPayload = (await createResponse.json()) as
        | CreatedRequest
        | { error?: string };

      if (!createResponse.ok || !("_id" in createPayload)) {
        throw new Error(
          "error" in createPayload && createPayload.error
            ? createPayload.error
            : "Impossible de créer la demande."
        );
      }

      const contactResponse = await fetch(
        `/api/exchange-requests/${createPayload._id}/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetChangerId: changer._id }),
        }
      );

      const contactPayload = (await contactResponse.json()) as
        | { request?: CreatedRequest; phone?: string; error?: string };

      if (!contactResponse.ok || !contactPayload.request) {
        throw new Error(
          contactPayload.error ?? "Impossible de récupérer le contact."
        );
      }

      setCreatedRequest(contactPayload.request);
      setContactPhone(contactPayload.phone ?? changer.phone);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Une erreur est survenue lors de la création de la demande."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#005129] text-lg font-bold text-white">
                {changer.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#005129]">
                  {counterpartLabel}
                </p>
                <h3 className="text-xl font-bold text-slate-800">
                  {changer.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {changer.neighborhood}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[changer.status]}`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current" />
                    {STATUS_LABELS[changer.status]}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                    <span className="material-symbols-outlined text-[18px] text-amber-500">
                      star
                    </span>
                    {changer.rating.toFixed(1)} ({changer.reviewCount})
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 rounded-2xl border border-slate-100 bg-[#f7faf3] p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {requestCurrencyLabel}
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
                  {changer.rate || "Non communiqué"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4">
              <h4 className="text-sm font-semibold text-slate-800">
                Demande d&apos;échange
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                Enregistrez votre demande pour suivre l&apos;échange dans l&apos;application.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Montant
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#005129]"
                    placeholder="150000"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    De
                  </span>
                  <input
                    value={fromCurrency}
                    onChange={(event) =>
                      setFromCurrency(event.target.value.toUpperCase())
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#005129]"
                    placeholder="XAF"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Vers
                  </span>
                  <input
                    value={toCurrency}
                    onChange={(event) =>
                      setToCurrency(event.target.value.toUpperCase())
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#005129]"
                    placeholder="EUR"
                  />
                </label>
              </div>

              {error ? (
                <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f59e0b] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">
                  receipt_long
                </span>
                {submitting
                  ? "Création de la demande..."
                  : "Créer la demande et afficher le contact"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <h4 className="text-sm font-semibold text-slate-800">
              Informations de contact
            </h4>

            {createdRequest ? (
              <>
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm font-medium text-emerald-800">
                    Demande enregistrée
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Statut: {createdRequest.status}
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    {createdRequest.amount} {createdRequest.fromCurrency} vers{" "}
                    {createdRequest.toCurrency}
                  </p>
                </div>

                <p className="mt-4 text-sm text-slate-500">Téléphone</p>
                <p className="mt-1 text-lg font-bold text-slate-800">{phone}</p>

                <div className="mt-4 flex flex-col gap-3">
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#005129] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#004322]"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      call
                    </span>
                    Appeler
                  </a>
                  <a
                    href={`https://wa.me/${whatsappPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f59e0b] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      chat
                    </span>
                    WhatsApp
                  </a>
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-[#f7faf3] p-4">
                <p className="text-sm text-slate-500">
                  Créez une demande d&apos;échange pour enregistrer votre intention et
                  débloquer les coordonnées du partenaire.
                </p>
              </div>
            )}

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <span className="material-symbols-outlined text-[20px] text-emerald-700">
                shield
              </span>
              <p className="text-sm text-emerald-800">
                Rencontrez-vous dans un lieu public sécurisé.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
