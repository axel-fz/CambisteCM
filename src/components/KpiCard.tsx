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
      className={`group relative overflow-hidden rounded-3xl border border-white/40  bg-white/60  p-6 shadow-lg backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl ${
        highlight ? "ring-2 ring-emerald-500/20" : ""
      }`}
    >
      <div className="relative z-10 flex items-start justify-between gap-4"> <div className="space-y-1">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-400 ">
            {title}
          </p>
          <p className={`text-3xl font-black tracking-tight ${
            highlight ? "text-emerald-700 " : "text-slate-800 "
          }`}>
            {value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner transition-transform group-hover:scale-110 ${
            highlight
              ? "bg-emerald-500 text-white shadow-emerald-900/10"
              : "bg-slate-100  text-slate-500 "
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-2"> <div className={`h-1.5 w-1.5 rounded-full ${highlight ? "bg-emerald-500" : "bg-slate-300 "}`} />
        <p className="text-xs font-semibold text-slate-500/70 ">{subtitle}</p>
      </div>

      {highlight && (
        <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl" />
      )}
    </div>
  );
}
