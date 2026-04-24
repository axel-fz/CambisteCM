/**
 * app/onboarding/page.tsx
 * Role selection screen shown immediately after sign-up.
 * The user picks "Échangeur" or "Changeur Pro", which POSTs to /api/user
 * and then redirects to /dashboard.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Show } from "@clerk/nextjs";

// Type for the two roles a user can choose
type Role = "echangeur" | "changeur";

// Features shown for each card
const ECHANGEUR_FEATURES = [
  "Accès aux offres de cambistes",
  "Contactez un changeur en < 15 min",
  "Historique de vos échanges",
];

const CHANGEUR_FEATURES = [
  "Publiez vos offres de change",
  "Recevez des demandes directes",
  "Badge « Changeur Vérifié »",
];

export default function OnboardingPage() {
  const router = useRouter();

  // Which card is being saved right now (null = none)
  const [saving, setSaving] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Called when the user clicks a role button.
   * POSTs the chosen role to /api/user then navigates to /dashboard.
   */
  async function selectRole(role: Role) {
    setSaving(role);
    setError(null);
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Erreur lors de l'enregistrement");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Veuillez reessayer."
      );
      setSaving(null); // re-enable buttons if there was an error
    }
  }

  return (
    <Show when="signed-in">   
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#f7faf3] px-4 py-12">
      {/* Logo */}
      <span className="text-[#181d19] text-2xl font-bold mb-2"> CambisteCM</span>

      {/* 3-step progress bar — step 1 active */}
     {/*  <div className="flex items-center gap-2 mb-10">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                step === 1
                  ? "bg-white text-[#005129] border-white"
                  : "bg-transparent text-white border-white/50"
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div className={`w-12 h-0.5 ${step === 1 ? "bg-white" : "bg-white/30"}`} />
            )}
          </div>
        ))}
      </div> */}

      {/* Heading */}
      <h1 className="text-[#181d19] text-3xl font-bold text-center mb-2">
        Qui êtes-vous ?
      </h1>
      <p className="text-[#404940] text-center mb-10 max-w-sm">
        Choisissez votre profil pour personnaliser votre expérience.
      </p>

      {/* Role cards */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
        {/* ── Échangeur card ── */}
        <RoleCard
          title="Échangeur"
          icon="person"
          description="Je veux échanger de la devise avec un cambiste local."
          features={ECHANGEUR_FEATURES}
          buttonLabel="Je suis échangeur"
          variant="outline"
          loading={saving === "echangeur"}
          disabled={saving !== null}
          onSelect={() => selectRole("echangeur")}
        />

        {/* ── Changeur Pro card ── */}
        <RoleCard
          title="Changeur Pro"
          icon="business_center"
          description="Je suis cambiste et je veux proposer mes services."
          features={CHANGEUR_FEATURES}
          buttonLabel="Je suis changeur"
          variant="filled"
          badge="Cambiste"
          loading={saving === "changeur"}
          disabled={saving !== null}
          onSelect={() => selectRole("changeur")}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-6 w-full max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}
      </main>
    </Show>
  );
}

/* ─────────────── Sub-component: RoleCard ─────────────── */
interface RoleCardProps {
  title: string;
  icon: string;
  description: string;
  features: string[];
  buttonLabel: string;
  variant: "outline" | "filled";
  badge?: string;
  loading: boolean;
  disabled: boolean;
  onSelect: () => void;
}

function RoleCard({
  title, icon, description, features,
  buttonLabel, variant, badge, loading, disabled, onSelect,
}: RoleCardProps) {
  return (
    <div className="relative flex-1 bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-4">
      {/* Optional "Recommandé" badge */}
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-xs font-bold px-4 py-1 rounded-full">
          {badge}
        </span>
      )}

      {/* Icon + title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-green-700 text-2xl">{icon}</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      </div>

      <p className="text-slate-500 text-sm">{description}</p>

      {/* Feature list */}
      <ul className="space-y-2">
        {features.map((feat) => (
          <li key={feat} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="material-symbols-outlined text-green-500 text-base mt-0.5">check_circle</span>
            {feat}
          </li>
        ))}
      </ul>

      {/* CTA button */}
      <button
        id={`btn-role-${title.toLowerCase().replace(/\s+/g, "-")}`}
        onClick={onSelect}
        disabled={disabled}
        className={`mt-auto w-full py-3 rounded-xl font-semibold text-sm transition-all ${
          variant === "filled"
            ? "bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
            : "border-2 border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-60"
        }`}
      >
        {loading ? "Chargement..." : buttonLabel}
      </button>
    </div>
  );
}
