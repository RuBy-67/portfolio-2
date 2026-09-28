"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSiteContent } from "@/components/providers/LocaleProvider";
import type { SiteContent } from "@/lib/i18n";

type TimelineEntry = SiteContent["parcours"]["formation"]["items"][number];

const tagColors: Record<string, string> = {
  WEB: "pixel-tag-cyan",
  DIGITAL: "pixel-tag-cyan",
  DEV: "pixel-tag-cyan",
  INFRA: "pixel-tag-yellow",
  IT: "pixel-tag-yellow",
  ALTERNANCE: "pixel-tag-yellow",
  LICENCE: "pixel-tag-cyan",
  BACHELOR: "pixel-tag-cyan",
  ARCHITECTURE: "pixel-tag-cyan",
  FOUNDATIONS: "pixel-tag-cyan",
  OPS: "pixel-tag-yellow",
  ERP: "pixel-tag-ruby",
  API: "pixel-tag-ruby",
  FLUX: "pixel-tag-ruby",
  FLOW: "pixel-tag-ruby",
  IA: "pixel-tag-ruby",
  AI: "pixel-tag-ruby",
  BIDATA: "pixel-tag-ruby",
  BIGDATA: "pixel-tag-ruby",
  AGENTS: "pixel-tag-ruby",
  SYSTEMS: "pixel-tag-ruby",
  "EN COURS": "pixel-tag-yellow",
  ONGOING: "pixel-tag-yellow",
  "SAGE X3": "pixel-tag-ruby",
  ODOO: "pixel-tag-ruby",
  SHOPIFY: "pixel-tag-ruby",
  THELIA: "pixel-tag-ruby",
  SODILFLOW: "pixel-tag-ruby",
  SODILINK: "pixel-tag-ruby",
};

const levelDot: Record<string, string> = {
  "LVL 1": "#3DB8D9",
  "LVL 2": "#D4A017",
  "LVL 3": "#C41E3A",
  MISSION: "#3D9A6A",
};

function TimelineItem({
  item,
  index,
  onVisible,
}: {
  item: TimelineEntry;
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
      style={{ transitionDelay: `${(index % 6) * 60}ms` }}
    >
      <div className="flex flex-col items-center shrink-0 w-5">
        <div
          className="w-2.5 h-2.5 mt-1.5 shrink-0 rounded-full"
          style={{ background: dotColor }}
        />
        <div className="flex-1 mt-1 w-px bg-white/10 min-h-4" />
      </div>

      <div
        className="flex-1 min-w-0 mb-6 bg-surface border border-white/5 rounded-xl p-5"
        style={{ borderLeft: `3px solid ${dotColor}` }}
      >
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span className="font-display text-xs font-semibold" style={{ color: dotColor }}>
            {item.level}
          </span>
          <span className="font-body text-muted text-sm">{item.year}</span>
        </div>

        <p className="font-display text-text font-semibold text-base mb-1">{item.title}</p>
        <p className="font-body mb-3 text-sm" style={{ color: dotColor }}>
          {item.role}
        </p>

        <p className="font-body text-muted leading-relaxed mb-4 text-[15px]">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span key={tag} className={`pixel-tag ${tagColors[tag] || ""}`}>
              {tag}
            </span>
          ))}
        </div>

        {item.links.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {item.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pixel text-xs py-2 px-3"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineGroup({
  title,
  items,
  startIndex,
  onVisible,
}: {
  title: string;
  items: TimelineEntry[];
  startIndex: number;
  onVisible: (index: number) => void;
}) {
  return (
    <div className="mb-14 last:mb-0">
      <h3 className="font-display text-lg font-semibold text-text mb-6 pb-3 border-b border-white/10">
        {title}
      </h3>
      <div>
        {items.map((item, i) => (
          <TimelineItem
            key={item.id}
            item={item}
            index={startIndex + i}
            onVisible={onVisible}
          />
        ))}
      </div>
    </div>
  );
}

export function Timeline() {
  const { parcours } = useSiteContent();
  const [visibleCount, setVisibleCount] = useState(0);
  const [barActive, setBarActive] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const total = parcours.formation.items.length + parcours.experience.items.length;
  const maxXp = 75;
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
        <div ref={headerRef} className="mb-12 text-center">
          <p className="section-subtitle mb-2">{parcours.subtitle}</p>
          <h2 className="section-title">{parcours.title}</h2>

          <div className="mt-6 max-w-xs mx-auto">
            <div className="flex justify-between font-body text-muted text-xs mb-2">
              <span>Progression</span>
              <span>{xpPercent}%</span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
            </div>
            <p className="font-body text-muted mt-2 text-sm">
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

        <TimelineGroup
          title={parcours.experience.title}
          items={parcours.experience.items}
          startIndex={0}
          onVisible={handleItemVisible}
        />
        <TimelineGroup
          title={parcours.formation.title}
          items={parcours.formation.items}
          startIndex={parcours.experience.items.length}
          onVisible={handleItemVisible}
        />
      </div>
    </section>
  );
}
