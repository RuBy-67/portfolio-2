"use client";

import { useEffect, useState } from "react";
import { getEggCount } from "@/lib/easterEggs";

export function EasterEggCounter() {
  const [count, setCount] = useState<{ found: number; total: number } | null>(null);

  useEffect(() => {
    const update = () => setCount(getEggCount());
    update();
    window.addEventListener("storage", update);
    window.addEventListener("rb-egg-found", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("rb-egg-found", update);
    };
  }, []);

  if (!count || count.found === 0) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 bg-bg-secondary border-2 border-yellow px-3 py-1"
      style={{
        transform: "translateX(-50%)",
        boxShadow: "2px 2px 0 #FFD700",
        pointerEvents: "none",
      }}
      aria-label={`${count.found} easter eggs trouvés sur ${count.total}`}
    >
      <span className="font-pixel text-yellow" style={{ fontSize: "7px" }}>
        🥚 {count.found}/{count.total} EGGS
      </span>
    </div>
  );
}
