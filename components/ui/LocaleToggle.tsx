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
      className="flex border border-white/10 rounded-md overflow-hidden"
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
            className="font-body text-xs px-2.5 py-1.5 transition-colors"
            style={{
              background: active ? "#C41E3A" : "transparent",
              color: active ? "#ECECF0" : "#8B8B96",
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
