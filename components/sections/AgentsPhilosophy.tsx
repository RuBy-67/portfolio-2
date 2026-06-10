"use client";

import { useEffect, useRef, useState } from "react";
import { useSiteContent } from "@/components/providers/LocaleProvider";
import type { SiteContent } from "@/lib/i18n";

function PrincipleBlock({
  principle,
  index,
}: {
  principle: SiteContent["agents"]["principles"][number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
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
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const colors = ["text-cyan", "text-yellow", "text-ruby"];
  const borders = ["pixel-card-cyan", "", ""];

  return (
    <div
      ref={ref}
      className={`pixel-card ${borders[index] || ""} transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {/* Terminal-style header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface">
        <span className={`font-pixel ${colors[index % colors.length]}`} style={{ fontSize: "9px" }}>
          [{String(index + 1).padStart(2, "0")}]
        </span>
        <h3
          className={`font-pixel ${colors[index % colors.length]}`}
          style={{ fontSize: "9px" }}
        >
          {principle.title}
        </h3>
      </div>

      <p className="terminal-text font-mono text-lg leading-relaxed">
        {principle.description}
      </p>
    </div>
  );
}

export function AgentsPhilosophy() {
  const { agents } = useSiteContent();

  return (
    <section
      id="agents"
      className="py-24 px-4"
      aria-label="IA et agents autonomes"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="mb-12 text-center">
          <p className="section-subtitle mb-2">// {agents.subtitle}</p>
          <h2 className="section-title">{agents.title}</h2>
        </div>

        {/* Intro,terminal style */}
        <div className="mb-10 bg-bg-secondary border-2 border-green p-6 font-mono" style={{ borderColor: "#00FF41" }}>
          <p className="terminal-prompt font-mono text-lg leading-relaxed" style={{ color: "#00FF41" }}>
            {agents.intro}
          </p>
        </div>

        {/* Principles */}
        <div className="grid md:grid-cols-3 gap-6">
          {agents.principles.map((principle, index) => (
            <PrincipleBlock key={principle.id} principle={principle} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
