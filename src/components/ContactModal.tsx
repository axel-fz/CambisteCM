/**
 * components/ContactModal.tsx
 * Contact modal shown when a user wants to reach a listed counterpart.
 */
"use client";

import { useEffect } from "react";

export interface ContactChanger {
  _id: string;
  name: string;
  initials: string;
  neighborhood: string;
  currency: string;
  rate: string;
  status: "online" | "busy" | "offline";
  rating: number;
  reviewCount: number;
  phone: string;
}

interface ContactModalProps {
  changer: ContactChanger | null;
  role: "echangeur" | "changeur";
  onClose: () => void;
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

export default function ContactModal({
  changer,
  role,
  onClose,
}: ContactModalProps) {
  useEffect(() => {
    if (!changer) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changer, onClose]);

  if (!changer) {
    return null;
  }

  const phone = changer.phone || "Non renseigné";
  const whatsappPhone = formatWhatsAppPhone(changer.phone);
  const currencyLabel =
    role === "echangeur" ? "Devise proposée" : "Devise recherchée";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
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

        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#005129] text-lg font-bold text-white">
            {changer.initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-slate-800">{changer.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{changer.neighborhood}</p>
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
              {changer.rate || "Non communiqué"}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4">
          <h4 className="text-sm font-semibold text-slate-800">
            Informations de contact
          </h4>
          <p className="mt-3 text-sm text-slate-500">Téléphone</p>
          <p className="mt-1 text-lg font-bold text-slate-800">{phone}</p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a
              href={`tel:${changer.phone}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#005129] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#004322]"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              Appeler
            </a>
            <a
              href={`https://wa.me/${whatsappPhone}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#f59e0b] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              WhatsApp
            </a>
          </div>
        </div>

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
  );
}
