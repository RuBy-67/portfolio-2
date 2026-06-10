"use client";

import Link from "next/link";
import { useSiteContent } from "@/components/providers/LocaleProvider";
import { discoverEgg, EGG_IDS } from "@/lib/easterEggs";

function handleAstroDiscover() {
  discoverEgg(EGG_IDS.ASTRO_FOUND);
}

export function Footer() {
  const { footer } = useSiteContent();

  return (
    <footer className="border-t-2 border-ruby bg-bg-secondary">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Astronomy easter egg ref (visible in source, subtle in UI) */}
        {/* RA 05h 34m 32s,Dec +22° 00' 52",M1, Nébuleuse du Crabe */}
        <div className="text-center mb-6">
          <span
            className="font-pixel text-ruby"
            style={{ fontSize: "10px", textShadow: "1px 1px 0 #8B0000" }}
          >
            RuBy
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-muted text-lg">
            {footer.copy}
          </p>

          <nav className="flex gap-6" aria-label="Liens légaux">
            {footer.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-pixel text-muted hover:text-cyan transition-none"
                style={{ fontSize: "9px" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Hidden astronomy note */}
        <p
          className="text-center mt-6 font-mono cursor-pointer select-none"
          style={{
            fontSize: "12px",
            color: "transparent",
            userSelect: "none",
            letterSpacing: "0.1em",
          }}
          data-hidden="true"
          aria-hidden="true"
          title={footer.astroNote}
          onClick={handleAstroDiscover}
        >
          {footer.astroNote}
        </p>

        {/* Visible subtle astronomy hint for those who look */}
        <p
          className="text-center mt-2 font-mono text-sm cursor-pointer select-none hover:text-yellow transition-none"
          style={{ color: "#1f1f1f", fontSize: "11px" }}
          onClick={handleAstroDiscover}
          title="?"
        >
          {footer.astroNote}
        </p>
      </div>
    </footer>
  );
}
