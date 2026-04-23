/**
 * app/layout.tsx
 * Root layout: wraps the entire app in <ClerkProvider> for auth context.
 * Uses Inter from Google Fonts for clean, modern typography.
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CambisteCM — Échange de devises P2P",
  description:
    "Trouvez des cambistes locaux fiables pour échanger vos devises rapidement et en toute sécurité.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="fr" className={`${inter.variable} h-full`}>
        <head>
          {/* Material Symbols for icon support across the app */}
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          />
        </head>
        <body className="antialiased bg-[#f7faf3] text-slate-800 h-full font-[var(--font-inter)]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
