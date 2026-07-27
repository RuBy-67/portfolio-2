"use client";

import { useEffect, useState } from "react";
import { useSiteContent } from "@/components/providers/LocaleProvider";

export function Hero() {
  const { hero } = useSiteContent();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center stars-bg overflow-hidden"
      aria-label="Introduction"
    >
      <div
        className={`relative z-10 text-center px-4 max-w-3xl transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h1
          className="font-display text-text mb-5"
          style={{
            fontSize: "clamp(2.75rem, 10vw, 5.5rem)",
            letterSpacing: "-0.04em",
          }}
        >
          {hero.title}
          <span className="text-ruby">.</span>
        </h1>

        <p
          className="font-display text-muted mb-4 font-medium"
          style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}
        >
          {hero.tagline}
        </p>

        <p className="font-body text-muted mb-10 max-w-xl mx-auto leading-relaxed">
          {hero.subtitle}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a href="#projets" className="btn-pixel">
            {hero.cta}
          </a>
          <a href="#contact" className="btn-pixel btn-pixel-cyan">
            {hero.ctaSecondary}
          </a>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-0 right-0 text-center pointer-events-none text-muted text-sm"
        style={{ animation: "float 2.4s ease-in-out infinite" }}
        aria-hidden="true"
      >
        ↓
      </div>
    </section>
  );
}
