"use client";
import dynamic from "next/dynamic";

// Render the marketing landing fully on the client (no SSR). This removes the
// server/client hydration step entirely, so browser extensions that mutate the
// DOM (e.g. autofill tools injecting `fdprocessedid` into buttons/inputs) can no
// longer cause hydration mismatches. Trade-off: the landing is not server-
// rendered for SEO; flip back to a direct <Landing/> import if SSR is needed.
const Landing = dynamic(() => import("./Landing"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen grid place-items-center">
      <div className="text-4xl font-display animate-bobble text-violet-700">🦧 …</div>
    </div>
  ),
});

export default function LandingClient() {
  return <Landing />;
}
