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
    <section id="contact" className="py-24 px-4" aria-label="Contact">
      <div className="max-w-2xl mx-auto text-center">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="section-subtitle mb-2">{contact.subtitle}</p>
          <h2 className="section-title mb-8">{contact.title}</h2>

          <div className="pixel-card text-left mb-8">
            <p className="font-body text-muted leading-relaxed mb-6">
              {contact.description}
            </p>

            <div className="bg-bg border border-white/5 rounded-lg p-4 font-body text-base mb-6">
              <span className="text-muted">{contact.emailLabel} </span>
              <span className="text-cyan">{contact.email}</span>
            </div>

            <a
              href={`mailto:${contact.email}`}
              className="btn-pixel inline-flex items-center gap-2"
            >
              {contact.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
