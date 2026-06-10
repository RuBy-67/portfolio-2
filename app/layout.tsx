import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { Scanlines } from "@/components/ui/Scanlines";
import { AmbientPlayer } from "@/components/audio/AmbientPlayer";
import { EasterEggProvider } from "@/components/easter-eggs/EasterEggProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rb-rubydev.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RuBy,Intégrateur ERP & Développeur IA",
    template: "%s | RuBy",
  },
  description:
    "Portfolio de RuBy,intégration ERP/e-commerce (Sage X3, Odoo, PrestaShop, Shopify), architecture de flux, développement IA & agents autonomes.",
  keywords: [
    "intégrateur ERP",
    "Sage X3",
    "Odoo",
    "PrestaShop",
    "Shopify",
    "agents IA",
    "BiData",
    "flux de commandes",
    "développeur",
  ],
  openGraph: {
    title: "RuBy,Intégrateur ERP & Développeur IA",
    description:
      "Architecture de flux, intégration ERP/e-commerce, agents autonomes. Master BiData Epitech.",
    url: siteUrl,
    siteName: "RuBy",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "RuBy,Intégrateur ERP & Développeur IA",
    description: "Architecture de flux, intégration ERP/e-commerce, agents autonomes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: "/img/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/img/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/img/icons/apple-touch-icon.png",
    other: [
      { rel: "manifest", url: "/img/icons/site.webmanifest" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${pressStart2P.variable} ${vt323.variable}`}
    >
      <body>
        <LocaleProvider>
          <Scanlines />
          <AmbientPlayer />
          <EasterEggProvider />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
