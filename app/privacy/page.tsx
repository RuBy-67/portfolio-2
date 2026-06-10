import type { Metadata } from "next";
import { PrivacyContent } from "@/components/pages/PrivacyContent";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité du site rb-rubydev.fr",
  robots: { index: true, follow: false },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
