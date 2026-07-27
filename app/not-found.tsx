import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404, Page introuvable",
  description: "Cette page n'existe pas.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 stars-bg">
      <div className="relative z-10 text-center max-w-lg">
        <p className="section-subtitle mb-4">Erreur</p>
        <h1 className="font-display text-ruby text-6xl font-bold mb-3">404</h1>
        <p className="font-display text-text text-xl mb-6">Page introuvable</p>

        <div className="pixel-card text-left mb-8">
          <p className="font-body text-muted leading-relaxed">
            Cette page n&apos;existe pas, ou n&apos;a jamais existé. Retour à l&apos;accueil recommandé.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-pixel">
            Retour accueil
          </Link>
          <a href="mailto:contact@rb-rubydev.fr" className="btn-pixel btn-pixel-cyan">
            Contact
          </a>
        </div>
      </div>
    </main>
  );
}
