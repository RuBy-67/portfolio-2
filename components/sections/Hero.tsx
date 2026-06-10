"use client";

import { useEffect, useRef, useState } from "react";
import { useSiteContent } from "@/components/providers/LocaleProvider";
import { markEggFound, EGG_IDS } from "@/lib/easterEggs";

export function Hero() {
  const { hero } = useSiteContent();
  const [visible, setVisible] = useState(false);
  const [whoDidThat, setWhoDidThat] = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleTitleClick = () => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    if (clickCount.current >= 5) {
      clickCount.current = 0;
      setWhoDidThat(true);
      markEggFound(EGG_IDS.RUBY_TITLE_CLICK);
      window.dispatchEvent(new Event("rb-egg-found"));
      setTimeout(() => setWhoDidThat(false), 3000);
    } else {
      clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 800);
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center stars-bg overflow-hidden"
      aria-label="Introduction"
    >
      {/* Pixel grid background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(196,30,58,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(196,30,58,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      {/* "Who did that?" toast */}
      {whoDidThat && (
        <div
          className="fixed top-20 left-1/2 z-[9999] font-pixel text-yellow bg-bg-secondary border-2 border-yellow px-4 py-3 text-center"
          style={{
            transform: "translateX(-50%)",
            fontSize: "10px",
            boxShadow: "3px 3px 0 #FFD700",
            animation: "fade-in 0.2s ease-out",
          }}
          aria-live="polite"
        >
          WHO DID THAT? 👀
        </div>
      )}

      <div
        className={`relative z-10 text-center px-4 transition-opacity duration-700 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <p
          className="font-pixel text-muted mb-4 tracking-widest"
          style={{ fontSize: "10px" }}
          aria-hidden="true"
        >
         - PLAYER 1 -
        </p>

        {/* Clickable title (easter egg on 5 clicks) */}
        <h1
          className="font-pixel text-ruby mb-6 select-none"
          style={{
            fontSize: "clamp(28px, 8vw, 72px)",
            textShadow: "4px 4px 0 #8B0000, 8px 8px 0 rgba(139,0,0,0.3)",
            letterSpacing: "0.1em",
            cursor: "pointer",
            display: "inline-block",
          }}
          onClick={handleTitleClick}
          title="..."
        >
          {hero.title}
          {/* Small cursor blink,inline, much smaller than the title */}
          <span
            aria-hidden="true"
            style={{
              fontSize: "clamp(10px, 2vw, 20px)",
              color: "#C41E3A",
              animation: "blink 1s step-end infinite",
              marginLeft: "4px",
              verticalAlign: "middle",
            }}
          >
            █
          </span>
        </h1>

        <p
          className="font-pixel text-cyan mb-3"
          style={{ fontSize: "clamp(6px, 1.5vw, 11px)", letterSpacing: "0.05em" }}
        >
          {hero.tagline}
        </p>

        <p
          className="font-mono text-text mb-10 max-w-xl mx-auto"
          style={{ fontSize: "clamp(16px, 2.5vw, 20px)" }}
        >
          {hero.subtitle}
        </p>

        <a
          href="#parcours"
          className="btn-pixel inline-block"
          style={{ fontSize: "10px" }}
        >
          ▶ {hero.cta}
        </a>

        <div className="mt-16 flex justify-center gap-6" aria-hidden="true">
          {["★", "★", "★"].map((star, i) => (
            <span
              key={i}
              className="text-yellow"
              style={{
                fontSize: "14px",
                animation: `star-twinkle ${1.5 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            >
              {star}
            </span>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-8 left-0 right-0 font-pixel text-muted text-center pointer-events-none"
        style={{ fontSize: "8px", animation: "float 2s ease-in-out infinite" }}
        aria-hidden="true"
      >
        ▼ SCROLL
      </div>
    </section>
  );
}
