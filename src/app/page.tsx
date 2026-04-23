/**
 * app/page.tsx
 * Public landing page for CambisteCM.
 * Uses <Show when="signed-in"> and <Show when="signed-out"> from Clerk
 * (never the deprecated SignedIn/SignedOut components).
 */
import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { RefreshCcw } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ═══════════════ NAVBAR ═══════════════ */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl flex items-center gap-2 font-bold text-[#005129] tracking-tight"
          >
            {/* put better logo for currency exchange with lucide-react */}
            <RefreshCcw />
            CambisteCM
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {/* underline text on hover */}
            <a
              href="#how-it-works"
              className="hover:text-green-700 hover:underline transition-colors"
            >
              Échange
            </a>
            <a
              href="#how-it-works"
              className="hover:text-green-700 hover:underline transition-colors"
            >
              Explorer
            </a>
            <a
              href="#how-it-works"
              className="hover:text-green-700 hover:underline transition-colors"
            >
              Solutions
            </a>
            <a
              href="#how-it-works"
              className="hover:text-green-700 hover:underline transition-colors"
            >
              Support
            </a>
          </nav>

          {/* Auth CTAs */}
          <div className="flex items-center gap-3">
            {/* Show these buttons only to signed-out visitors */}
            <Show when="signed-out">
              <Link
                href="/sign-in"
                id="btn-sign-in"
                className="text-sm font-medium text-slate-700 hover:text-green-700 transition-colors px-4 py-2"
              >
                Se connecter
              </Link>
              <Link
                href="/sign-up"
                id="btn-get-started"
                className="text-sm font-semibold bg-[#005129] hover:bg-green-700 text-white px-5 py-2 rounded-full transition-colors shadow-sm"
              >
                Commencer →
              </Link>
            </Show>

            {/* Show this link only to signed-in users */}
            <Show when="signed-in">
              <Link
                href="/dashboard"
                id="btn-mon-espace"
                className="text-sm font-semibold bg-[#005129] hover:bg-green-700 text-white px-5 py-2 rounded-full transition-colors shadow-sm"
              >
                Mon espace →
              </Link>
            </Show>
          </div>
        </div>
      </header>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="flex-1 bg-[#f7faf3] py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Left: headline + CTA */}
          <div className="text-white space-y-6">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Plateforme P2P de change
            </span>
            <h1 className="text-5xl font-extrabold text-[#181d19] leading-tight">
              Échangez vos devises avec des{" "}
              <span className="text-[#005129]">cambistes</span> locaux de
              confiance.
            </h1>
            <p className="text-[#404940] text-lg">
              Trouvez un changeur près de chez vous en moins de 15 minutes.
              Sécurisé, rapide, transparent.
            </p>
            <div className="flex flex-wrap gap-4">
              <Show when="signed-out">
                <Link
                  href="/sign-up"
                  className="bg-white text-green-700 font-bold px-7 py-3 rounded-full hover:bg-green-50 transition-colors shadow"
                >
                  Démarrer gratuitement
                </Link>
                <Link
                  href="/sign-in"
                  className="border-2 border-white/60 text-white font-semibold px-7 py-3 rounded-full hover:bg-white/10 transition-colors"
                >
                  Se connecter
                </Link>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="bg-[#005129] text-white font-bold px-7 py-3 rounded-full hover:bg-green-700 transition-colors shadow"
                >
                  Accéder au tableau de bord
                </Link>
              </Show>
            </div>
          </div>

          {/* Right: "Offre Urgente" mock card */}
          <div className="bg-white  rounded-2xl shadow-2xl p-6 space-y-4 max-w-sm mx-auto md:mx-0 w-full">
            {/* Card header */}
            <div className="flex items-center justify-between">
              <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                Offre Urgente
              </span>
              <span className="text-slate-400 text-xs">Il y a 3 min</span>
            </div>

            {/* Exchange preview */}
            <div className="text-center py-4">
              <p className="text-3xl font-extrabold text-slate-800">
                1 500 EUR
              </p>
              <p className="text-green-600 font-bold text-lg mt-1">
                → 982 500 XAF
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Taux : 655 XAF / EUR
              </p>
            </div>

            {/* Cambiste info (blurred phone for locked state) */}
            <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center">
                MK
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">
                  Marcus K.
                </p>
                <p className="text-slate-400 text-xs">Bastos, Yaoundé</p>
              </div>
              {/* Blurred phone number */}
              <p className="text-slate-300 text-sm blur-sm select-none font-mono">
                +237 6XX XXX XXX
              </p>
            </div>

            {/* Unlock CTA */}
            <button className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-white font-bold text-sm transition-colors">
              🔓 Débloquer le contact
            </button>

            <p className="text-center text-slate-400 text-xs">
              Accès immédiat pour 500 XAF
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS BAR ═══════════════ */}
      <section className=" py-10 px-6 bg-[#f7faf3]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 bg-[#f7faf3] md:grid-cols-4 gap-8 text-center">
          {[
            { value: "5K+", label: "Utilisateurs actifs" },
            { value: "300+", label: "Cambistes vérifiés" },
            { value: "99 %", label: "Taux de succès" },
            { value: "< 15m", label: "Temps moyen de contact" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-[#015129] bg-[#f7faf3]">
                {value}
              </p>
              <p className="text-slate-400 text-sm mt-1 text-[#015129] bg-[#f7faf3]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ COMMENT ÇA MARCHE ═══════════════ */}
      <section id="how-it-works" className="py-24 px-6 bg-[#f7faf3]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-slate-500 text-center mb-16 max-w-xl mx-auto">
            Échangez vos devises en 4 étapes simples, en moins de 15 minutes.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                icon: "lock_open",
                title: "Débloquez le contact",
                desc: "Accédez au numéro du changeur pour 500 XAF.",
              },
              {
                step: 4,
                icon: "handshake",
                title: "Échangez en confiance",
                desc: "Rencontrez-vous et effectuez votre échange.",
              },
            ].map(({ step, icon, title, desc }) => (
              <div
                key={step}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#015129] text-white text-sm font-bold flex items-center justify-center">
                    {step}
                  </span>
                  <span className="material-symbols-outlined text-[#015129] text-2xl">
                    {icon}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800">{title}</h3>
                <p className="text-slate-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="bg-[#1e293b] text-slate-400 py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          {/* Brand description */}
          <div>
            <p className="text-white text-lg font-bold mb-3"> CambisteCM</p>
            <p className="text-sm leading-relaxed">
              La plateforme P2P de référence pour échanger vos devises avec des
              cambistes locaux vérifiés au Cameroun et en Afrique Centrale.
            </p>
          </div>

          {/* Useful links */}
          <div>
            <p className="text-white font-semibold mb-3">Liens utiles</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/sign-up"
                  className="hover:text-white transition-colors"
                >
                  S&apos;inscrire
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  className="hover:text-white transition-colors"
                >
                  Se connecter
                </Link>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-white transition-colors"
                >
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Devenir cambiste
                </a>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <p className="text-white font-semibold mb-3">Légal</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Conditions d&apos;utilisation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Mentions légales
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-slate-800 text-center text-xs">
          © {new Date().getFullYear()} CambisteCM. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
