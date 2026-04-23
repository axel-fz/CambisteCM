/**
 * components/Sidebar.tsx
 * Persistent left sidebar for the dashboard layout.
 * Uses usePathname() to highlight the active route.
 * Includes Clerk's UserButton at the bottom for account management.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

// Each nav item: label, icon (Material Symbol), and href
const NAV_ITEMS = [
  { label: "Tableau de bord", icon: "dashboard",      href: "/dashboard" },
  { label: "Mes Demandes",    icon: "list_alt",       href: "/dashboard/requests" },
  { label: "Marketplace",     icon: "storefront",     href: "/dashboard/marketplace" },
  { label: "Historique",      icon: "history",        href: "/dashboard/history" },
  { label: "Paramètres",      icon: "settings",       href: "/dashboard/settings" },
];

export default function Sidebar() {
  // usePathname() tells us which route is active, so we can highlight it
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-100 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <span className="text-lg font-bold text-green-700 tracking-tight">
          💱 CambisteCM
        </span>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ label, icon, href }) => {
          // Exact match for /dashboard, prefix match for sub-routes
          const isActive =
            href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User button at the bottom */}
      <div className="px-6 py-5 border-t border-slate-100 flex items-center gap-3">
        <UserButton afterSignOutUrl="/" />
        <span className="text-sm text-slate-500">Mon compte</span>
      </div>
    </aside>
  );
}
