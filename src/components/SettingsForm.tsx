"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface UserProfile {
  name: string;
  neighborhood: string;
  phone: string;
  role: "echangeur" | "changeur";
}

interface SettingsFormProps {
  initialUser: UserProfile;
}

async function updateProfile(payload: Pick<UserProfile, "name" | "neighborhood" | "phone">) {
  const res = await fetch("/api/user", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? "Une erreur est survenue.");
  }
}

export default function SettingsForm({ initialUser }: SettingsFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initialUser);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── TanStack Mutation ────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      setSuccessMsg("Profil mis à jour avec succès !");
      router.refresh();
    },
    onError: (err: Error) => setSuccessMsg(null),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);
    mutation.mutate({ name: form.name, neighborhood: form.neighborhood, phone: form.phone });
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Nom complet
            </span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#005129]"
              placeholder="Jean Dupont"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Téléphone
            </span>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#005129]"
              placeholder="+237..."
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Quartier
            </span>
            <input
              value={form.neighborhood}
              onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#005129]"
              placeholder="Bonapriso"
              required
            />
          </label>
        </div>

        {/* Feedback banner */}
        {(mutation.isError || successMsg) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              mutation.isError
                ? "border-red-100 bg-red-50 text-red-700"
                : "border-emerald-100 bg-emerald-50 text-emerald-700"
            }`}
          >
            {mutation.isError
              ? (mutation.error as Error).message
              : successMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center justify-center rounded-xl bg-[#005129] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#004322] disabled:opacity-50"
        >
          {mutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}
