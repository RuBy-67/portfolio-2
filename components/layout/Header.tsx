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
    <header className="fixed top-0 left-0 right-0 z-40 bg-bg border-b-2 border-ruby">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-none shrink-0"
          aria-label="RuBy,Accueil"
        >
          <Image
            src="/img/icons/favicon-32x32.png"
            alt="RuBy logo"
            width={28}
            height={28}
            className="pixel"
            priority
          />
          <span
            className="font-pixel text-ruby hidden sm:block"
            style={{ fontSize: "11px", textShadow: "1px 1px 0 #8B0000" }}
          >
            RuBy
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5" aria-label="Navigation principale">
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-pixel text-muted hover:text-cyan transition-none"
              style={{ fontSize: "9px", letterSpacing: "0.05em" }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <LocaleToggle />
          <button
            className="md:hidden font-pixel text-ruby border-2 border-ruby px-3 py-2 hover:bg-ruby hover:text-bg transition-none"
            style={{ fontSize: "9px" }}
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="md:hidden bg-bg-secondary border-t-2 border-ruby px-4 pb-4"
          aria-label="Navigation mobile"
        >
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block font-pixel text-muted hover:text-cyan py-3 border-b border-surface transition-none"
              style={{ fontSize: "9px" }}
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
