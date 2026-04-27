/**
 * components/ChangersTable.tsx
 * Client component that fetches and displays active changers.
 * Shows status badges and an unlock button ("Débloquer" / "Débloqué").
 */
"use client";

import { useEffect, useState } from "react";

// Shape of a Changer returned from the API
interface Changer {
  _id: string;
  name: string;
  initials: string;
  neighborhood: string;
  currency: string;
  rate: string;
  status: "online" | "busy" | "offline";
  rating: number;
  reviewCount: number;
}

// Map status values to badge colours
const STATUS_STYLES: Record<string, string> = {
  online:  "bg-green-100 text-green-700",
  busy:    "bg-amber-100 text-amber-700",
  offline: "bg-slate-100 text-slate-500",
};

const STATUS_LABELS: Record<string, string> = {
  online:  "En ligne",
  busy:    "Occupé",
  offline: "Hors ligne",
};

export default function ChangersTable() {
  const [changers, setChangers]     = useState<Changer[]>([]);
  const [loading, setLoading]       = useState(true);
  // Set of changer IDs that the user has "unlocked"
  const [unlocked, setUnlocked]     = useState<Set<string>>(new Set());

  // Fetch changers from the API when the component mounts
  useEffect(() => {
    fetch("/api/changers")
      .then((res) => res.json())
      .then((data: Changer[]) => {
        setChangers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Handle the "Débloquer" button click
  function handleUnlock(id: string) {
    // Mark the row as unlocked in local state
    setUnlocked((prev) => new Set(prev).add(id));
    // Let the user know payment is required (payment gateway TBD)
    alert("Paiement 500 XAF requis — intégrer la passerelle plus tard");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400"> <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
        Chargement des cambistes…
      </div>
    );
  }

  if (changers.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400"> <span className="material-symbols-outlined text-5xl block mb-2">search_off</span>
        Aucun cambiste disponible pour ces critères.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm"> <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
          <tr>
            <th className="text-left px-6 py-4">Profil</th> <th className="text-left px-6 py-4">Statut</th>
            <th className="text-left px-6 py-4">Taux Proposé</th> <th className="text-left px-6 py-4">Évaluation</th>
            <th className="text-left px-6 py-4">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {changers.map((c) => {
            const isUnlocked = unlocked.has(c._id);
            return (
              <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                {/* Profile column: initials avatar + name + location */}
                <td className="px-6 py-4 flex items-center gap-3"> <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center text-sm">
                    {c.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{c.name}</p> <p className="text-slate-400 text-xs">{c.neighborhood || "—"}</p>
                  </div>
                </td>

                {/* Status badge */}
                <td className="px-6 py-4"> <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[c.status]}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                </td>

                {/* Exchange rate */}
                <td className="px-6 py-4 font-medium text-slate-700"> 1 {c.currency} → <span className="text-green-600">{c.rate || "—"}</span>
                </td>

                {/* Star rating */}
                <td className="px-6 py-4"> <span className="text-amber-400">★</span>
                  <span className="font-medium ml-1">{c.rating.toFixed(1)}</span> <span className="text-slate-400 ml-1">({c.reviewCount})</span>
                </td>

                {/* Unlock / Unlocked button */}
                <td className="px-6 py-4">
                  {isUnlocked ? (
                    <button
                      disabled
                      className="px-4 py-1.5 rounded-full text-xs font-semibold bg-green-600 text-white cursor-default"
                    >
                      ✓ Débloqué
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnlock(c._id)}
                      className="px-4 py-1.5 rounded-full text-xs font-semibold border border-amber-400 text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      Débloquer
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
