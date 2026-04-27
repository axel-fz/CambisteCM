/**
 * components/Sidebar.tsx
 * Persistent left sidebar for the dashboard layout.
 * - Mobile (< md): hidden by default, slides in as a full-height overlay when toggled.
 * - Desktop (md+): always visible fixed rail.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard",      icon: "dashboard",  href: "/dashboard" },
  { label: "Mes demandes",   icon: "list_alt",   href: "/dashboard/requests" },
  { label: "Marketplace",    icon: "storefront", href: "/dashboard/marketplace" },
  { label: "Historique",     icon: "history",    href: "/dashboard/history" },
  { label: "Paramètres",     icon: "settings",   href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  const NavContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <span className="text-lg font-bold tracking-tight text-[#005129]">
          Cambiste<span className="text-[#c6c10b]">CM</span>
        </span>
        {/* Close button — mobile only */}
        <button
          className="md:hidden flex items-center justify-center rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          onClick={() => setOpen(false)}
          aria-label="Fermer le menu"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ label, icon, href }) => {
          const isActive =
            href === "/dashboard" ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-50 text-[#005129]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="flex items-center gap-3 border-t border-slate-100 px-6 py-5">
        <UserButton />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">
            {user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Mon compte"}
          </p>
          <p className="text-xs text-slate-500">Compte connecté</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile hamburger trigger (top-left, fixed) ─────────────────── */}
      <button
        className="fixed left-4 top-4 z-50 flex md:hidden items-center justify-center rounded-xl border border-slate-100 bg-white p-2 shadow-sm"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <span className="material-symbols-outlined text-xl text-slate-600">menu</span>
      </button>

      {/* ── Mobile backdrop ──────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-100 bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {NavContent}
      </aside>

      {/* ── Desktop sidebar (always visible) ─────────────────────────────── */}
      <aside className="hidden md:flex h-full w-64 flex-shrink-0 flex-col border-r border-slate-100 bg-white transition-colors duration-300">
        {NavContent}
      </aside>
    </>
  );
}
