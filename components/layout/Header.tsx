"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "@/components/providers/LocaleProvider";
import { LocaleToggle } from "@/components/ui/LocaleToggle";

export function Header() {
  const { nav } = useSiteContent();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-bg/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0"
          aria-label="RuBy, Accueil"
        >
          <Image
            src="/img/icons/favicon-32x32.png"
            alt="RuBy logo"
            width={28}
            height={28}
            priority
          />
          <span className="font-display text-ruby font-bold hidden sm:block text-sm tracking-tight">
            RuBy
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Navigation principale">
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-body text-sm text-muted hover:text-text transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <LocaleToggle />
          <button
            className="md:hidden font-body text-sm text-ruby border border-ruby/50 rounded-md px-3 py-1.5 hover:bg-ruby hover:text-white transition-colors"
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "✕" : "Menu"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="md:hidden bg-bg-secondary border-t border-white/5 px-4 pb-4"
          aria-label="Navigation mobile"
        >
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block font-body text-muted hover:text-text py-3 border-b border-white/5 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
