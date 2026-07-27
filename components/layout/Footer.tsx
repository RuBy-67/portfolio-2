"use client";

import Link from "next/link";
import { useSiteContent } from "@/components/providers/LocaleProvider";

export function Footer() {
  const { footer } = useSiteContent();

  return (
    <footer className="border-t border-white/5 bg-bg-secondary">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="font-display text-ruby font-bold text-sm mb-1">RuBy</p>
            <p className="font-body text-muted text-sm">{footer.copy}</p>
          </div>

          <nav className="flex gap-6" aria-label="Liens légaux">
            {footer.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-sm text-muted hover:text-cyan transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
