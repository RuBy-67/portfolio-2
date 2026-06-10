"use client";

import { useEffect, useRef, useState } from "react";
import { useSiteContent } from "@/components/providers/LocaleProvider";
import { markEggFound, discoverEgg, EGG_IDS } from "@/lib/easterEggs";

export function BeyondCode() {
  const { beyond } = useSiteContent();
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [planeActive, setPlaneActive] = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAviationClick = () => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    if (clickCount.current >= 3) {
      clickCount.current = 0;
      setPlaneActive(true);
      markEggFound(EGG_IDS.AVIATION_TRIPLE_CLICK);
      window.dispatchEvent(new Event("rb-egg-found"));
      setTimeout(() => setPlaneActive(false), 5000);
    } else {
      clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 800);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="beyond"
      className="py-24 px-4 bg-bg-secondary stars-bg relative overflow-hidden"
      aria-label="Au-delà du code"
    >
      {/* Starfield overlay */}
      <div className="absolute inset-0 opacity-20" aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 15% 25%, #fff 0%, transparent 100%), radial-gradient(1px 1px at 75% 15%, #00D4FF 0%, transparent 100%), radial-gradient(1px 1px at 40% 70%, #fff 0%, transparent 100%), radial-gradient(1px 1px at 85% 60%, #FFD700 0%, transparent 100%), radial-gradient(2px 2px at 55% 40%, #fff 0%, transparent 100%)",
        }}
      />

      <div
        className={`max-w-4xl mx-auto relative z-10 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Section header */}
        <div className="mb-12 text-center">
          <p className="section-subtitle mb-2">// {beyond.subtitle}</p>
          <h2 className="section-title">{beyond.title}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Plane animation easter egg */}
          {planeActive && (
            <div
              className="fixed bottom-0 left-0 w-full z-50 pointer-events-none"
              style={{ height: "40px" }}
              aria-hidden="true"
            >
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  fontSize: "28px",
                  animation: "fly-plane 5s linear forwards",
                }}
              >
                ✈
              </div>
              <style>{`
                @keyframes fly-plane {
                  from { left: -40px; }
                  to { left: calc(100% + 40px); }
                }
              `}</style>
            </div>
          )}

          {/* Aviation */}
          <div
            className="pixel-card pixel-card-cyan cursor-pointer select-none"
            onClick={handleAviationClick}
            title="✈"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="font-pixel text-cyan text-xl">✈</span>
              <h3 className="font-pixel text-cyan" style={{ fontSize: "11px" }}>
                {beyond.aviation.title}
              </h3>
            </div>

            <p className="font-mono text-text text-lg leading-relaxed mb-6">
              {beyond.aviation.description}
            </p>

            {beyond.aviation.instagramUrl && (
              <a
                href={beyond.aviation.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pixel btn-pixel-cyan inline-flex items-center gap-2"
                style={{ fontSize: "8px" }}
              >
                {beyond.aviation.instagramLabel}
              </a>
            )}
          </div>

          {/* Astronomy */}
          <div className="pixel-card">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-pixel text-yellow text-xl">★</span>
              <h3 className="font-pixel text-ruby" style={{ fontSize: "11px" }}>
                {beyond.astronomy.title}
              </h3>
            </div>

            <p className="font-mono text-text text-lg leading-relaxed">
              {beyond.astronomy.description}
            </p>

            {/* Subtle easter egg coords */}
            <p
              className="mt-4 font-pixel cursor-pointer select-none hover:text-yellow transition-none"
              style={{ fontSize: "7px", color: "#1a1a1a" }}
              onClick={() => discoverEgg(EGG_IDS.ASTRO_FOUND)}
              title="?"
            >
              RA 05h 34m 32s,Dec +22°
            </p>
          </div>

          {/* Volley */}
          <div className="pixel-card pixel-card-yellow">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-pixel text-green text-xl">🏐</span>
              <h3 className="font-pixel text-green" style={{ fontSize: "11px" }}>
                {beyond.volleyball.title}
              </h3>
            </div>

            <p className="font-mono text-text text-lg leading-relaxed">
              {beyond.volleyball.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
