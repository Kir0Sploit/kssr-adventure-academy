import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KSSR Adventure Academy",
  description:
    "A play-first learning game for Malaysian primary school students (Darjah 1-6) — Maths, Bahasa Melayu and English.",
  manifest: "/manifest.webmanifest",
  applicationName: "KSSR Adventure Academy",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "KSSR Academy" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#070a18",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="aurora" aria-hidden />
        {children}
      </body>
    </html>
  );
}
