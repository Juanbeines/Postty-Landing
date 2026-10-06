import Landing from "@/components/Landing";

/* The landing itself lives in components/Landing.tsx so the Spanish and
   English routes render the same page; the locale comes from the root
   layout's LocaleProvider. */
export default function Page() {
  return <Landing />;
}
