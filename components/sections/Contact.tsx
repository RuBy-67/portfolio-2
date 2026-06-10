"use client";

import { useEffect, useRef, useState } from "react";
import { useSiteContent } from "@/components/providers/LocaleProvider";

export function Contact() {
  const { contact } = useSiteContent();
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
    <section
      id="contact"
      className="py-24 px-4"
      aria-label="Contact"
    >
      <div className="max-w-2xl mx-auto text-center">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Section header */}
          <p className="section-subtitle mb-2">// {contact.subtitle}</p>
          <h2 className="section-title mb-8">{contact.title}</h2>

          {/* Card */}
          <div className="pixel-card text-left mb-8">
            <p className="font-mono text-text text-lg leading-relaxed mb-6">
              {contact.description}
            </p>

            {/* Email display */}
            <div className="bg-bg-secondary border border-surface p-4 font-mono text-lg mb-6">
              <span className="text-muted">$ mail </span>
              <span className="text-cyan">{contact.email}</span>
              <span className="text-ruby animate-blink">█</span>
            </div>

            <a
              href={`mailto:${contact.email}`}
              className="btn-pixel inline-flex items-center gap-3"
              style={{ fontSize: "10px" }}
            >
              ✉ {contact.cta}
            </a>
          </div>

          {/* Decorative pixel heart */}
          <p className="font-pixel text-muted" style={{ fontSize: "9px" }}>
            &lt;3 MADE WITH PIXEL ART
          </p>
        </div>
      </div>
    </section>
  );
}
