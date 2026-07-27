"use client";

import { useEffect, useRef, useState } from "react";
import { useSiteContent } from "@/components/providers/LocaleProvider";

export function BeyondCode() {
  const { beyond } = useSiteContent();
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

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

  const cards = [
    {
      key: "aviation",
      accent: "text-cyan",
      data: beyond.aviation,
      icon: "✈",
    },
    {
      key: "astronomy",
      accent: "text-yellow",
      data: beyond.astronomy,
      icon: "★",
    },
    {
      key: "volleyball",
      accent: "text-green",
      data: beyond.volleyball,
      icon: "●",
    },
  ] as const;

  return (
    <section
      ref={sectionRef}
      id="beyond"
      className="py-24 px-4 bg-bg-secondary stars-bg relative overflow-hidden"
      aria-label="Au-delà du code"
    >
      <div
        className={`max-w-4xl mx-auto relative z-10 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="mb-12 text-center">
          <p className="section-subtitle mb-2">{beyond.subtitle}</p>
          <h2 className="section-title">{beyond.title}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.key} className="pixel-card flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className={`${card.accent} text-lg`}>{card.icon}</span>
                <h3 className={`font-display font-semibold text-base ${card.accent}`}>
                  {card.data.title}
                </h3>
              </div>

              <p className="font-body text-muted leading-relaxed mb-4 flex-1">
                {card.data.description}
              </p>

              {card.data.links.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                  {card.data.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-pixel btn-pixel-cyan inline-flex text-xs py-2 px-3"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
