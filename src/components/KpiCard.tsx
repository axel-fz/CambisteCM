/**
 * components/KpiCard.tsx
 * A reusable metric card for the dashboard.
 * Shows an icon, main value, title, and a small subtitle (trend / context).
 */

// Props accepted by KpiCard
interface KpiCardProps {
  title: string;       // e.g. "Contacts Débloqués"
  value: string;       // e.g. "12" or "4.8"
  subtitle: string;    // e.g. "↑ 2 ce mois" or "basé sur 32 avis"
  icon: string;        // Material Symbol icon name, e.g. "contacts"
  highlight?: boolean; // If true, the card uses a green accent style
}

export default function KpiCard({ title, value, subtitle, icon, highlight = false }: KpiCardProps) {
  return (
    <div
      className={`relative rounded-2xl p-6 shadow-sm border flex flex-col gap-1 ${
        highlight
          ? "bg-green-600 text-white border-green-500"
          : "bg-white text-slate-800 border-slate-100"
      }`}
    >
      {/* Icon in the top-right corner */}
      <span
        className={`material-symbols-outlined absolute top-5 right-5 text-3xl ${
          highlight ? "text-green-200" : "text-green-500"
        }`}
      >
        {icon}
      </span>

      {/* Title */}
      <p className={`text-sm font-medium ${highlight ? "text-green-100" : "text-slate-500"}`}>
        {title}
      </p>

      {/* Main value */}
      <p className="text-3xl font-bold tracking-tight">{value}</p>

      {/* Subtitle / trend */}
      <p className={`text-xs ${highlight ? "text-green-200" : "text-green-600"}`}>
        {subtitle}
      </p>
    </div>
  );
}
