"use client";

import { useState } from "react";
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

export default function SettingsForm({ initialUser }: SettingsFormProps) {
  const [form, setForm] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: form.name,
            neighborhood: form.neighborhood,
            phone: form.phone,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Profil mis à jour avec succès !" });
        router.refresh();
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "Une erreur est survenue." });
      }
    } catch (error) {
      console.error("Update profile failed", error);
      setMessage({ type: "error", text: "Erreur de connexion." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Nom complet
          </span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#005129]"
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
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#005129]"
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
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#005129]"
            placeholder="Bonapriso"
            required
          />
        </label>

      </div>

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-red-100 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-xl bg-[#005129] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#004322] disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </form>
  );
}
