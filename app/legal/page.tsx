import type { Metadata } from "next";
import { LegalContent } from "@/components/pages/LegalContent";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site rb-rubydev.fr",
  robots: { index: true, follow: false },
};

export default function LegalPage() {
  return <LegalContent />;
}
