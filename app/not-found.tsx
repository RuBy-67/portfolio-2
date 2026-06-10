import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404,Game Over",
  description: "Cette page n'existe pas ou n'a jamais existé.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 stars-bg">
      {/* Pixel grid */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(196,30,58,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(196,30,58,0.3) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 text-center max-w-lg">
        {/* Game Over */}
        <p
          className="font-pixel text-muted mb-4"
          style={{ fontSize: "9px", letterSpacing: "0.1em" }}
        >
         ,SYSTEM MESSAGE ,
        </p>

        <h1
          className="game-over font-pixel mb-4"
          style={{ fontSize: "clamp(24px, 7vw, 56px)" }}
        >
          GAME OVER
        </h1>

        <p
          className="font-pixel text-ruby mb-8"
          style={{
            fontSize: "clamp(18px, 4vw, 32px)",
            textShadow: "2px 2px 0 #8B0000",
          }}
        >
          404
        </p>

        {/* Terminal message */}
        <div className="bg-bg-secondary border-2 border-ruby p-6 mb-8 text-left">
          <p className="terminal-text font-mono text-lg mb-2">
            <span style={{ color: "#00D4FF" }}>&gt; </span>
            ERROR: path not found
          </p>
          <p className="font-mono text-muted text-lg mb-2">
            Cette page n&apos;existe pas,ou n&apos;a jamais existé.
          </p>
          <p className="font-mono text-muted text-base">
            Erreur de navigation. Retour à la base recommandé.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-pixel" style={{ fontSize: "9px" }}>
            ▶ RETOUR ACCUEIL
          </Link>
          <a
            href="mailto:contact@rb-rubydev.fr"
            className="btn-pixel btn-pixel-cyan"
            style={{ fontSize: "9px" }}
          >
            ✉ CONTACT
          </a>
        </div>

        {/* Pixel decoration */}
        <p
          className="mt-10 font-pixel text-muted"
          style={{ fontSize: "8px", letterSpacing: "0.05em" }}
        >
         ,INSERT COIN TO CONTINUE ,
        </p>
      </div>
    </main>
  );
}
