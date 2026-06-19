/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serverful build. `standalone` produces a self-contained server in
  // .next/standalone — ideal for a cheap VPS (Hostinger/Exabytes) or local run.
  output: "standalone",
  reactStrictMode: true,
  images: { unoptimized: true },
  // Workspace packages ship ESM in dist; let Next transpile them cleanly.
  transpilePackages: ["@kssr/shared", "@kssr/curriculum", "@kssr/game-engine"],
};

export default nextConfig;
