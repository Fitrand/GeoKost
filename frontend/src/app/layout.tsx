import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "GeoKost — Temukan Kost Impian Dekat Kampusmu",
  description:
    "Platform WebGIS cerdas untuk mencari, membandingkan, dan memesan kost mahasiswa. Didukung algoritma C4.5 untuk rekomendasi personal terbaik.",
  keywords: "kost mahasiswa, cari kost, kost dekat kampus, GeoKost, WebGIS, rekomendasi kost",
  openGraph: {
    title: "GeoKost — Rekomendasi Kost Mahasiswa Berbasis AI & Peta",
    description: "Cari kost terbaik di sekitar kampusmu dengan teknologi GIS dan Machine Learning.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Design System Fonts: Plus Jakarta Sans (display) + Inter (body) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
        />
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
