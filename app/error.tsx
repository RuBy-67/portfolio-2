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
        <h1
          className="font-pixel text-ruby mb-6"
          style={{
            fontSize: "clamp(18px, 5vw, 32px)",
            textShadow: "2px 2px 0 #8B0000",
          }}
        >
          SYSTEM ERROR
        </h1>

        <div className="bg-bg-secondary border-2 border-ruby p-6 mb-6 text-left">
          <p className="terminal-text font-mono text-lg mb-2">
            <span style={{ color: "#00D4FF" }}>&gt; </span>
            500,Internal Error
          </p>
          <p className="font-mono text-muted text-lg">
            Une erreur inattendue s&apos;est produite. Le système est toujours en ligne.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="btn-pixel"
            style={{ fontSize: "9px" }}
          >
            ↺ CONTINUE
          </button>
          <a href="/" className="btn-pixel btn-pixel-cyan" style={{ fontSize: "9px" }}>
            ▶ ACCUEIL
          </a>
        </div>
      </div>
    </main>
  );
}
