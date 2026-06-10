"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useSiteContent } from "@/components/providers/LocaleProvider";

export function PrivacyContent() {
  const { privacy, common } = useSiteContent();

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <nav className="mb-8" aria-label="Fil d'Ariane">
            <Link
              href="/"
              className="font-pixel text-muted hover:text-cyan transition-none"
              style={{ fontSize: "8px" }}
            >
              {common.backHome}
            </Link>
          </nav>

          <div className="mb-10">
            <h1 className="section-title">{privacy.title}</h1>
          </div>

          <div className="space-y-6">
            {privacy.sections.map((section) => (
              <div key={section.title} className="pixel-card pixel-card-cyan">
                <h2
                  className="font-pixel text-cyan mb-4"
                  style={{ fontSize: "10px" }}
                >
                  {section.title}
                </h2>
                <p className="font-mono text-text text-lg leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link href="/" className="btn-pixel btn-pixel-cyan inline-block" style={{ fontSize: "9px" }}>
              {common.backToHome}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
