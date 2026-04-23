/**
 * components/KpiCard.tsx
 * Reusable KPI card used across the dashboard.
 */

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  highlight?: boolean;
}

export default function KpiCard({
  title,
  value,
  subtitle,
  icon,
  highlight = false,
}: KpiCardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ${
        highlight ? "border-l-4 border-l-emerald-500" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          <p className="text-sm text-slate-500">{title}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            highlight
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
      </div>
      <p className="mt-6 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}
