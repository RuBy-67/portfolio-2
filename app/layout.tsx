import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/components/providers/LocaleProvider";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rb-rubydev.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RuBy, développeur & architecte de flux",
    template: "%s | RuBy",
  },
  description:
    "Portfolio de RuBy : co-fondateur de Normly, intégration ERP / e-commerce chez Sodilog, outils web et Master Big Data à Epitech.",
  keywords: [
    "développeur",
    "architecte de flux",
    "Sage X3",
    "Odoo",
    "PrestaShop",
    "Shopify",
    "Thelia",
    "Normly",
    "Sodilog",
    "Sodilink",
    "intégration ERP",
  ],
  openGraph: {
    title: "RuBy, développeur & architecte de flux",
    description:
      "Co-fondateur de Normly, intégration ERP / e-commerce et architectures de flux. Master Big Data Epitech.",
    url: siteUrl,
    siteName: "RuBy",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "RuBy, développeur & architecte de flux",
    description: "Co-fondateur de Normly, intégration ERP / e-commerce et architectures de flux.",
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
    other: [{ rel: "manifest", url: "/img/icons/site.webmanifest" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${syne.variable} ${dmSans.variable}`}>
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
