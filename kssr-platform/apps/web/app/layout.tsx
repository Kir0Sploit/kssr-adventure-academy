import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const display = Fredoka({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const body = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "KSSR Adventure Academy",
  description:
    "A play-first learning game for Malaysian primary school students (Darjah 1-6) — Maths, Bahasa Melayu and English.",
  manifest: "/manifest.webmanifest",
  applicationName: "KSSR Adventure Academy",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "KSSR Academy" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#9fe3ff",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <div className="scene" aria-hidden>
          <span className="dots" />
          <span className="shape s1" />
          <span className="shape s2" />
          <span className="shape s3" />
          <span className="shape s4" />
        </div>
        {children}
      </body>
    </html>
  );
}
