"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "echangeur" | "changeur";

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

export default function OnboardingFlow() {
  const router = useRouter();
  const [saving, setSaving] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setSaving(null);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f7faf3] px-4 py-12">
      <div className="mb-8 flex flex-col items-center">
        
        <span className="text-[#005129] text-3xl font-black tracking-tight">Cambiste <span className="text-amber-500  ">CM</span></span>
      </div>

      <h1 className="text-[#181d19] text-4xl font-extrabold text-center mb-2 tracking-tight">
        Bienvenue !
      </h1>
      <p className="text-[#404940] text-center mb-12 max-w-sm font-medium opacity-70">
        Choisissez votre profil pour commencer à échanger en toute sécurité.
      </p>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl">
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

      {error && (
        <p className="mt-8 w-full max-w-2xl rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm font-medium text-red-700 shadow-sm">
          {error}
        </p>
      )}
    </main>
  );
}

function RoleCard({
  title, icon, description, features,
  buttonLabel, variant, badge, loading, disabled, onSelect,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
  return (
    <div className={`relative flex-1 rounded-[2.5rem] border border-white/40 bg-white/60 p-8 shadow-2xl backdrop-blur-xl flex flex-col gap-6 transition-all hover:-translate-y-2 ${
        variant === "filled" ? "ring-4 ring-emerald-500/10" : ""
    }`}>
      {badge && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
          {badge}
        </span>
      )}

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-[#005129] text-3xl">{icon}</span>
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
      </div>

      <p className="text-slate-500 font-medium leading-relaxed">{description}</p>

      <ul className="space-y-3 mt-2">
        {features.map((feat: string) => (
          <li key={feat} className="flex items-center gap-3 text-sm font-bold text-slate-600">
            <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
            {feat}
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        disabled={disabled}
        className={`mt-auto w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg ${
          variant === "filled"
            ? "bg-[#005129] hover:bg-[#004322] text-white shadow-emerald-900/20 disabled:opacity-60"
            : "border-2 border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        }`}
      >
        {loading ? "Initialisation..." : buttonLabel}
      </button>
    </div>
  );
}
