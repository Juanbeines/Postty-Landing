import LegalPage, { legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata("es", "privacy");

export default function PrivacyPage() {
  return <LegalPage locale="es" kind="privacy" />;
}
