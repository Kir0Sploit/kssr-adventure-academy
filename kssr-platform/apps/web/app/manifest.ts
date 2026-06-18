import type { MetadataRoute } from "next";

// Base path for GitHub Pages project sites (e.g. "/my-repo"). Empty for root.
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KSSR Adventure Academy",
    short_name: "KSSR Academy",
    description: "A play-first learning game for Malaysian primary school students.",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    orientation: "any",
    background_color: "#070a18",
    theme_color: "#070a18",
    icons: [{ src: `${base}/icon.svg`, sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
