/**
 * app/layout.tsx
 * Root layout: wraps the entire app in <ClerkProvider> for auth context.
 * Uses a standard Google Fonts link for clean, modern typography.
 */
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import QueryProvider from "@/components/QueryProvider";
import "./globals.css";
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
    <html lang="fr" className="h-full" suppressHydrationWarning>
      <head>
        {/* Google Font: Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        
        {/* Material Symbols for icon support across the app */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="antialiased bg-[#f7faf3] text-slate-800  h-full transition-colors duration-300">
        <ClerkProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
