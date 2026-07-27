"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSiteContent } from "@/components/providers/LocaleProvider";
import type { SiteContent } from "@/lib/i18n";

type Project = SiteContent["projets"]["items"][number];

function ProjectCard({ project, index }: { project: Project; index: number }) {
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
    <article
      ref={ref}
      className={`pixel-card flex flex-col h-full transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-4 mb-4">
        {project.logo ? (
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-bg shrink-0 flex items-center justify-center border border-white/5">
            <Image
              src={project.logo}
              alt=""
              width={48}
              height={48}
              className="object-contain w-full h-full"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-ruby/15 border border-ruby/30 shrink-0 flex items-center justify-center">
            <span className="font-display text-ruby font-bold text-lg">
              {project.monogram}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-lg text-text leading-tight">
            {project.title}
          </h3>
          <p className="font-body text-ruby text-sm mt-0.5">{project.role}</p>
        </div>
      </div>

      <p className="font-body text-muted leading-relaxed text-[15px] flex-1 mb-5">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {project.tags.map((tag) => (
          <span key={tag} className="pixel-tag pixel-tag-ruby">
            {tag}
          </span>
        ))}
      </div>

      {project.links.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/5">
          {project.links.map((link) => (
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

      {project.links.length === 0 && project.internalNote && (
        <p className="font-body text-xs text-muted/70 mt-auto pt-4 border-t border-white/5">
          {project.internalNote}
        </p>
      )}
    </article>
  );
}

export function Projects() {
  const { projets } = useSiteContent();

  return (
    <section id="projets" className="py-24 px-4" aria-label="Projets">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <p className="section-subtitle mb-2">{projets.subtitle}</p>
          <h2 className="section-title mb-4">{projets.title}</h2>
          <p className="font-body text-muted max-w-2xl mx-auto">{projets.intro}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {projets.items.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
