import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tucun — Mapa do Pescador",
  description:
    "Descubra os melhores pontos de pesca de Rondônia. Mapa interativo, feed social, guia de peixes e muito mais.",
  keywords: [
    "pesca",
    "Rondônia",
    "mapa de pesca",
    "pontos de pesca",
    "app de pesca",
    "tucun",
  ],
  authors: [{ name: "Tucun" }],
  openGraph: {
    title: "Tucun — Mapa do Pescador",
    description:
      "Descubra os melhores pontos de pesca de Rondônia. Mapa interativo, feed social, guia de peixes e muito mais.",
    url: "https://tucun.app",
    siteName: "Tucun",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://tucun.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tucun — Mapa do Pescador",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tucun — Mapa do Pescador",
    description: "Descubra os melhores pontos de pesca de Rondônia.",
    images: ["https://tucun.app/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://tucun.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ backgroundColor: "#0A1628", color: "#E8F5E9" }}
      >
        {children}
      </body>
    </html>
  );
}
