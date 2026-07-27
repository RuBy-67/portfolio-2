"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="fr">
      <body
        style={{
          background: "#0B0B0D",
          color: "#ECECF0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ color: "#C41E3A", marginBottom: "1rem", fontSize: "1.5rem" }}>
            Erreur critique
          </h1>
          <p style={{ color: "#8B8B96", marginBottom: "2rem" }}>
            Une erreur critique s&apos;est produite.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "transparent",
              color: "#C41E3A",
              border: "1px solid #C41E3A",
              borderRadius: "6px",
              padding: "12px 24px",
              cursor: "pointer",
              fontFamily: "system-ui, sans-serif",
              fontSize: "14px",
            }}
          >
            Recharger
          </button>
        </div>
      </body>
    </html>
  );
}
