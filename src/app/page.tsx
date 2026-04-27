"use client";

import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { name: "Comment ça marche", href: "#how-it-works" },
    { name: "À propos", href: "#about" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white transition-colors duration-300">

      {/* ═══════════════ NAVBAR ═══════════════ */}
      <header
        className={`fixed z-50 transition-all duration-300 ${
          scrolled
            ? "top-4 left-[5%] right-[5%] md:left-[10%] md:right-[10%] rounded-full shadow-lg ring-1 ring-slate-200 bg-white/80 backdrop-blur-md"
            : "top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm"
        }`}
      >
        <div
          className={`mx-auto px-6 h-16 flex items-center justify-between transition-all duration-300 ${
            scrolled ? "max-w-full" : "max-w-6xl"
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            className="text-xl flex items-center font-bold text-[#005129] tracking-tight"
          >
            Cambiste<span className="text-[#c6c10b]">CM</span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-[#005129] hover:underline underline-offset-4 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Auth Buttons + Hamburger */}
          <div className="flex items-center gap-3">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3 border-l border-slate-100 pl-4">
              <Show when="signed-out">
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-slate-700 hover:text-[#005129] transition-colors px-2"
                >
                  Se connecter
                </Link>
                <Link
                  href="/sign-up"
                  className="text-sm font-semibold bg-[#005129] hover:bg-green-700 text-white px-5 py-2 rounded-full transition-colors shadow-sm"
                >
                  Commencer →
                </Link>
              </Show>

              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold bg-[#005129] hover:bg-green-700 text-white px-5 py-2 rounded-full transition-colors shadow-sm"
                >
                  Mon espace →
                </Link>
              </Show>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden text-2xl text-slate-700"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden absolute top-[64px] left-0 right-0 bg-white shadow-md border-t border-slate-100 flex flex-col gap-4 px-6 py-5 animate-slideDown">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-slate-700 font-medium text-base py-2 hover:text-[#005129] transition-colors"
              >
                {link.name}
              </a>
            ))}

            <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
              <Show when="signed-out">
                <Link
                  href="/sign-in"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-slate-700 hover:text-[#005129] transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-semibold text-center bg-[#005129] hover:bg-green-700 text-white px-5 py-3 rounded-full transition-colors shadow-sm"
                >
                  Commencer →
                </Link>
              </Show>

              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-semibold text-center bg-[#005129] hover:bg-green-700 text-white px-5 py-3 rounded-full transition-colors shadow-sm"
                >
                  Mon espace →
                </Link>
              </Show>
            </div>
          </div>
        )}
      </header>

      {/* Spacer so content doesn't hide under fixed header */}
      <div className="h-16" />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="flex-1 bg-[#f7faf3] py-20 px-6 transition-colors">
        <div className="max-w-6xl mx-auto items-center">
          <div className="space-y-6 flex flex-col justify-center items-center">
            <span className="inline-block bg-[#005129]/10 text-[#005129] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
              Plateforme P2P de change
            </span>
            <h1 className="text-6xl max-w-[800px] text-center font-extrabold text-slate-900 leading-tight">
              Échangez vos devises{" "}
              <span className="text-[#005129]">directement</span> avec des
              changeurs locaux
            </h1>
            <p className="text-slate-600 max-w-[700px] text-center text-lg">
              La plateforme sécurisée pour trouver les meilleurs taux d&apos;échange
              à Douala. Connectez-vous avec des cambistes vérifiés et effectuez
              vos transactions en toute confiance.
            </p>
            <div className="flex justify-center mx-auto items-center flex-wrap gap-4 pt-4">
              <Show when="signed-out">
                <Link
                  href="/sign-up"
                  className="bg-white text-[#005129] font-bold px-8 py-4 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors shadow-lg"
                >
                  Démarrer gratuitement
                </Link>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="bg-[#005129] text-white font-bold px-8 py-4 rounded-full hover:bg-green-700 transition-colors shadow-lg"
                >
                  Accéder au tableau de bord
                </Link>
              </Show>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS BAR ═══════════════ */}
      <section className="py-12 px-6 bg-white border-y border-slate-100 transition-colors">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "5K+", label: "Utilisateurs actifs" },
            { value: "300+", label: "Cambistes vérifiés" },
            { value: "99 %", label: "Taux de succès" },
            { value: "< 15m", label: "Temps moyen de contact" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-[#005129]">{value}</p>
              <p className="text-slate-500 text-sm mt-1 uppercase font-semibold tracking-wide">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ À PROPOS ═══════════════ */}
      <section id="about" className="py-24 px-6 bg-white transition-colors">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block bg-[#005129]/10 text-[#005129] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-6">
              Notre Mission
            </span>
            <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
              Démocratiser l&apos;accès aux devises en Afrique Centrale
            </h2>
            <div className="space-y-4 text-slate-600 text-lg leading-relaxed">
              <p>
                CambisteCM est né d&apos;un constat simple : l&apos;échange de devises est
                souvent complexe, coûteux et entouré d&apos;incertitudes.
              </p>
              <p>
                Notre mission est de révolutionner ce secteur en mettant
                directement en relation les particuliers avec des changeurs
                professionnels vérifiés. Nous éliminons les intermédiaires
                inutiles pour vous offrir une transparence totale.
              </p>
              <p>
                Grâce à notre plateforme P2P sécurisée, vous bénéficiez des
                meilleurs taux du marché et d&apos;un environnement de confiance
                pour toutes vos transactions, que vous soyez un voyageur, un
                entrepreneur ou un professionnel du change.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[#005129]/5 rounded-3xl transform rotate-3 scale-105 transition-transform duration-500 hover:rotate-6"></div>
            <div className="relative bg-white border border-slate-100 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">verified_user</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Confiance absolue</h3>
                  <p className="text-sm text-slate-500">Profils 100% vérifiés</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#005129]/10 text-[#005129] rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">savings</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Zéro frais cachés</h3>
                  <p className="text-sm text-slate-500">Taux transparents</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">bolt</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Rapidité</h3>
                  <p className="text-sm text-slate-500">Mise en relation en 15m</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ COMMENT ÇA MARCHE ═══════════════ */}
      <section
        id="how-it-works"
        className="py-24 px-6 bg-[#f7faf3] transition-colors"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-bold text-slate-900 text-center mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-slate-600 text-center mb-16 max-w-xl mx-auto">
            Échangez vos devises en 3 étapes simples, en moins de 15 minutes.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                icon: "account_circle",
                title: "Créez un compte",
                desc: "Inscrivez-vous en 30 secondes avec votre email.",
              },
              {
                step: 2,
                icon: "search",
                title: "Trouvez un cambiste",
                desc: "Filtrez par devise, quartier et disponibilité.",
              },
              {
                step: 3,
                icon: "handshake",
                title: "Échangez en confiance",
                desc: "Rencontrez-vous et effectuez votre échange.",
              },
            ].map(({ step, icon, title, desc }) => (
              <div
                key={step}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#005129] text-white text-sm font-bold flex items-center justify-center">
                    {step}
                  </span>
                  <span className="material-symbols-outlined text-[#005129] text-2xl">
                    {icon}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6 border-t border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div>
            <p className="text-white text-lg font-bold mb-4 flex items-center">
              Cambiste<span className="text-[#c6c10b]">CM</span>
            </p>
            <p className="text-sm leading-relaxed text-slate-400">
              La plateforme P2P de référence pour échanger vos devises avec des
              cambistes locaux vérifiés au Cameroun et en Afrique Centrale.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold mb-4 tracking-wide uppercase text-xs">
              Liens utiles
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/sign-up" className="hover:text-emerald-400 transition-colors">
                  S&apos;inscrire
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="hover:text-emerald-400 transition-colors">
                  Se connecter
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Devenir cambiste
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-4 tracking-wide uppercase text-xs">
              Légal
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Conditions d&apos;utilisation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Mentions légales
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800/50 text-center text-xs tracking-widest uppercase">
          © {new Date().getFullYear()} Cambiste
          <span className="text-[#c6c10b]">CM</span>. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}