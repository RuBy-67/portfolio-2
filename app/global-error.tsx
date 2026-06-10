"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="fr">
      <body style={{ background: "#0D0D0D", color: "#E8E8E8", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0, fontFamily: "monospace" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ color: "#C41E3A", marginBottom: "1rem", fontSize: "clamp(16px, 4vw, 28px)" }}>
            CRITICAL ERROR
          </h1>
          <p style={{ color: "#888", marginBottom: "2rem" }}>
            Une erreur critique s&apos;est produite.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "transparent",
              color: "#C41E3A",
              border: "2px solid #C41E3A",
              padding: "12px 24px",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
          >
            RECHARGER
          </button>
        </div>
      </body>
    </html>
  );
}
