import LegalPage, { legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata("es", "terms");

export default function TermsPage() {
  return <LegalPage locale="es" kind="terms" />;
}
