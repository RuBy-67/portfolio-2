import fr from "@/content/fr/site.json";
import en from "@/content/en/site.json";

export type Locale = "fr" | "en";
export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_STORAGE_KEY = "rb-locale";

export type SiteContent = typeof fr;

const content: Record<Locale, SiteContent> = {
  fr,
  en: en as SiteContent,
};

export function getSiteContent(locale: Locale): SiteContent {
  return content[locale];
}

export function isLocale(value: string): value is Locale {
  return value === "fr" || value === "en";
}
