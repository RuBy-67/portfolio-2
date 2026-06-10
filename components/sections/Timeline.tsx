"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSiteContent } from "@/components/providers/LocaleProvider";
import type { SiteContent } from "@/lib/i18n";

const tagColors: Record<string, string> = {
  WEB: "pixel-tag-cyan",
  DIGITAL: "pixel-tag-cyan",
  DEV: "pixel-tag-cyan",
  INFRA: "pixel-tag-yellow",
  IT: "pixel-tag-yellow",
  ALTERNANCE: "pixel-tag-yellow",
  LICENCE: "pixel-tag-cyan",
  ARCHITECTURE: "pixel-tag-cyan",
  ERP: "pixel-tag-ruby",
  API: "pixel-tag-ruby",
  FLUX: "pixel-tag-ruby",
  IA: "pixel-tag-ruby",
  BIDATA: "pixel-tag-ruby",
  AGENTS: "pixel-tag-ruby",
  "EN COURS": "pixel-tag-yellow",
  "SAGE X3": "pixel-tag-ruby",
  ODOO: "pixel-tag-ruby",
};

const levelDot: Record<string, string> = {
  "LVL 1": "#00D4FF",
  "LVL 2": "#FFD700",
  "LVL 3": "#C41E3A",
  MISSION: "#00FF41",
};

function TimelineItem({
  item,
  index,
  onVisible,
}: {
  item: SiteContent["parcours"]["items"][number];
  index: number;
  onVisible: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          onVisible(index);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index, onVisible]);

  const dotColor = levelDot[item.level] || "#888";

  return (
    <div
      ref={ref}
      className={`flex gap-4 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {/* Dot + line */}
      <div className="flex flex-col items-center shrink-0" style={{ width: "20px" }}>
        <div
          className="w-3 h-3 mt-1 shrink-0"
          style={{ background: dotColor, border: `2px solid ${dotColor}` }}
        />
        <div
          className="flex-1 mt-1"
          style={{ width: "2px", background: "#252525", minHeight: "16px" }}
        />
      </div>

      {/* Card */}
      <div className="flex-1 min-w-0 mb-6 bg-bg-secondary border border-surface p-4" style={{ borderLeft: `3px solid ${dotColor}` }}>
        {/* Header row */}
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span
            className="font-pixel"
            style={{ fontSize: "8px", color: dotColor }}
          >
            {item.level}
          </span>
          <span className="font-mono text-muted" style={{ fontSize: "14px" }}>
            {item.year}
          </span>
        </div>

        {/* Title + role */}
        <p
          className="font-pixel text-text mb-1"
          style={{ fontSize: "10px", letterSpacing: "0.04em" }}
        >
          {item.title}
        </p>
        <p className="font-mono mb-3" style={{ fontSize: "16px", color: dotColor }}>
          {item.role}
        </p>

        {/* Description */}
        <p className="font-mono text-muted leading-relaxed mb-3" style={{ fontSize: "16px" }}>
          {item.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span key={tag} className={`pixel-tag ${tagColors[tag] || ""}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Timeline() {
  const { parcours } = useSiteContent();
  const [visibleCount, setVisibleCount] = useState(0);
  const [barActive, setBarActive] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const total = parcours.items.length;
  const maxXp = 75; // master en cours
  const xpPercent = barActive
    ? Math.max(8, Math.round((visibleCount / total) * maxXp))
    : 0;

  const handleItemVisible = useCallback((index: number) => {
    setVisibleCount((prev) => Math.max(prev, index + 1));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBarActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="parcours" className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <div ref={headerRef} className="mb-12 text-center">
          <p className="section-subtitle mb-2">// {parcours.subtitle}</p>
          <h2 className="section-title">{parcours.title}</h2>

          {/* XP bar */}
          <div className="mt-6 max-w-xs mx-auto">
            <div
              className="flex justify-between font-pixel text-muted mb-1"
              style={{ fontSize: "7px" }}
            >
              <span>XP</span>
              <span>{xpPercent}%,PROGRESSION</span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
            </div>
            <p className="font-mono text-muted mt-2" style={{ fontSize: "14px" }}>
              {visibleCount === 0
                ? parcours.xp.scrollHint
                : visibleCount >= total
                  ? parcours.xp.maxHint
                  : parcours.xp.stepsHint
                      .replace("{count}", String(visibleCount))
                      .replace("{total}", String(total))}
            </p>
          </div>
        </div>

        {/* Items */}
        <div>
          {parcours.items.map((item, index) => (
            <TimelineItem
              key={item.id}
              item={item}
              index={index}
              onVisible={handleItemVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
