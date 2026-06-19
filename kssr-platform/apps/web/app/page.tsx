import LandingClient from "@/components/LandingClient";

// Marketing landing page. Rendered client-only to avoid hydration mismatches
// from DOM-mutating browser extensions. The app lives at /main, admin at /admin.
export default function Page() {
  return <LandingClient />;
}
