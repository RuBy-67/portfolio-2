"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { Locale } from "@/lib/i18n";

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  const options: { id: Locale; label: string }[] = [
    { id: "fr", label: "FR" },
    { id: "en", label: "EN" },
  ];

  return (
    <div
      className="flex border-2 border-surface"
      role="group"
      aria-label="Choisir la langue"
    >
      {options.map(({ id, label }) => {
        const active = locale === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setLocale(id)}
            className="font-pixel transition-none px-2 py-1"
            style={{
              fontSize: "8px",
              background: active ? "#C41E3A" : "transparent",
              color: active ? "#E8E8E8" : "#888888",
            }}
            aria-pressed={active}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
