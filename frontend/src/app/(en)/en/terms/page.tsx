import LegalPage, { legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata("en", "terms");

export default function TermsPage() {
  return <LegalPage locale="en" kind="terms" />;
}
