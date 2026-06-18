// Base path for GitHub Pages project sites. The deploy workflow sets
// NEXT_PUBLIC_BASE_PATH to "/<repo-name>"; locally it stays empty (root).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export — required for GitHub Pages (no Node server at runtime).
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  // Our workspace packages ship ESM in dist; let Next transpile them cleanly.
  transpilePackages: ["@kssr/shared", "@kssr/curriculum", "@kssr/game-engine"],
};

export default nextConfig;
