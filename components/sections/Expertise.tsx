"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSiteContent } from "@/components/providers/LocaleProvider";
import type { SiteContent } from "@/lib/i18n";

function ExpertiseBlock({
  block,
  index,
}: {
  block: SiteContent["expertise"]["blocks"][number];
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

  return (
    <div
      ref={ref}
      className={`pixel-card transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <h3 className={`font-display font-semibold text-lg mb-4 ${index === 0 ? "text-ruby" : "text-cyan"}`}>
        {block.title}
      </h3>

      <p className="font-body text-muted leading-relaxed mb-6">{block.description}</p>

      {block.techs.length > 0 && (
        <>
          {block.techs.some((t) => t.logo) && (
            <ul className="mt-4 pt-4 border-t border-white/5 space-y-2.5">
              {block.techs
                .filter((tech) => tech.logo)
                .map((tech) => (
                  <li key={tech.name} className="flex items-center gap-3 min-h-8">
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                      <Image
                        src={tech.logo!}
                        alt=""
                        width={24}
                        height={24}
                        className="object-contain w-6 h-6 opacity-90"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <span className="font-body text-sm text-text">{tech.name}</span>
                  </li>
                ))}
            </ul>
          )}
          {block.techs.some((t) => !t.logo) && (
            <div
              className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${
                block.techs.some((t) => t.logo) ? "mt-3" : "mt-4 pt-4 border-t border-white/5"
              }`}
            >
              {block.techs
                .filter((tech) => !tech.logo)
                .map((tech) => (
                  <span key={tech.name} className="font-body text-xs text-muted tracking-wide uppercase">
                    {tech.name}
                  </span>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function Expertise() {
  const { expertise } = useSiteContent();

  return (
    <section id="expertise" className="py-24 px-4 bg-bg-secondary" aria-label="Expertise technique">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <p className="section-subtitle mb-2">{expertise.subtitle}</p>
          <h2 className="section-title">{expertise.title}</h2>
        </div>

        <div className="pixel-card mb-10 border-l-[3px] border-l-yellow">
          <p className="font-body text-text leading-relaxed">{expertise.intro}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expertise.blocks.map((block, index) => (
            <ExpertiseBlock key={block.id} block={block} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
