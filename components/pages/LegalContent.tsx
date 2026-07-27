"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useSiteContent } from "@/components/providers/LocaleProvider";

export function LegalContent() {
  const { legal, common } = useSiteContent();

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <nav className="mb-8" aria-label="Fil d'Ariane">
            <Link
              href="/"
              className="font-body text-sm text-muted hover:text-cyan transition-colors"
            >
              {common.backHome}
            </Link>
          </nav>

          <div className="mb-10">
            <h1 className="section-title">{legal.title}</h1>
          </div>

          <div className="space-y-6">
            {legal.sections.map((section) => (
              <div key={section.title} className="pixel-card">
                <h2 className="font-display font-semibold text-cyan text-base mb-3">
                  {section.title}
                </h2>
                <p className="font-body text-muted leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link href="/" className="btn-pixel inline-block">
              {common.backToHome}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
