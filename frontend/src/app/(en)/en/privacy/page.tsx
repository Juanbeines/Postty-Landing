import LegalPage, { legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata("en", "privacy");

export default function PrivacyPage() {
  return <LegalPage locale="en" kind="privacy" />;
}
