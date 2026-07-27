"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="section-subtitle mb-4">Erreur</p>
        <h1 className="font-display text-ruby text-3xl font-bold mb-6">
          Une erreur est survenue
        </h1>

        <div className="pixel-card text-left mb-6">
          <p className="font-body text-muted leading-relaxed">
            Une erreur inattendue s&apos;est produite. Vous pouvez réessayer ou revenir à l&apos;accueil.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => reset()} className="btn-pixel">
            Réessayer
          </button>
          <a href="/" className="btn-pixel btn-pixel-cyan">
            Accueil
          </a>
        </div>
      </div>
    </main>
  );
}
