"use client";

import { useEffect, useRef, useState } from "react";

export function AmbientPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const saved = localStorage.getItem("rb-muted");
    const shouldMute = saved === "true";
    setMuted(shouldMute);

    const audio = new Audio("/song/space.mp3");
    audio.loop = true;
    audio.volume = 0.15;
    audioRef.current = audio;

    if (!shouldMute) {
      // Try immediate autoplay,works in most cases on first visit
      const tryPlay = () => {
        audio.play().catch(() => {});
      };
      tryPlay();

      // Fallback: start on any first user interaction if autoplay was blocked
      const onInteraction = () => {
        audio.play().catch(() => {});
        window.removeEventListener("click", onInteraction);
        window.removeEventListener("keydown", onInteraction);
        window.removeEventListener("scroll", onInteraction, { capture: true });
        window.removeEventListener("touchstart", onInteraction);
      };
      window.addEventListener("click", onInteraction, { once: true });
      window.addEventListener("keydown", onInteraction, { once: true });
      window.addEventListener("scroll", onInteraction, { capture: true, once: true });
      window.addEventListener("touchstart", onInteraction, { once: true });
    }

    return () => {
      audio.pause();
    };
  }, []);

  const handleToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !muted;
    setMuted(next);
    localStorage.setItem("rb-muted", String(next));
    if (next) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={muted ? "Activer la musique" : "Couper la musique"}
      title={muted ? "Activer la musique" : "Couper la musique"}
      className="fixed bottom-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-bg-secondary border-2 border-ruby hover:bg-ruby hover:text-bg transition-none"
      style={{ fontFamily: "monospace", fontSize: "16px" }}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
