/**
 * components/Sidebar.tsx
 * Persistent left sidebar for the dashboard layout.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { label: "Mes demandes", icon: "list_alt", href: "/dashboard/requests" },
  { label: "Marketplace", icon: "storefront", href: "/dashboard/marketplace" },
  { label: "Historique", icon: "history", href: "/dashboard/history" },
  { label: "Paramètres", icon: "settings", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-slate-100 bg-white  transition-colors duration-300">
      <div className="border-b border-slate-100 px-6 py-5">
        <span className="text-lg font-bold tracking-tight text-[#005129] ">
          CambisteCM
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ label, icon, href }) => {
          const isActive =
            href === "/dashboard" ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-50  text-[#005129] "
                  : "text-slate-600  hover:bg-slate-50  hover:text-slate-800 "
              }`}
            >
              <span className="material-symbols-outlined text-xl">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-slate-100 px-6 py-5">
        <UserButton />
        <div className="min-w-0"> <p className="truncate text-sm font-medium text-slate-800 ">
            {user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Mon compte"}
          </p>
          <p className="text-xs text-slate-500 ">Compte connecté</p>
        </div>
      </div>
    </aside>
  );
}
