import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CareerArc — Career Guidance for Varanasi Students",
    template: "%s | CareerArc",
  },
  description:
    "CareerArc — Career guidance for every student. ARC-T 2.0 Recognition & Guidance Day — 25-26 April 2026, BITE Campus, Varanasi.",
  metadataBase: new URL("https://careerarc.academy"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://careerarc.academy",
    siteName: "CareerArc",
    title: "CareerArc — Career Guidance for Varanasi Students",
    description:
      "ARC-T 2.0 Recognition & Guidance Day. 13 zones. Career guidance. Exciting prizes. Free for all registered students.",
    images: [{ url: "/logos/arct-logo.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerArc — Career Guidance for Varanasi Students",
    description:
      "ARC-T 2.0 Recognition & Guidance Day — 25-26 April 2026, BITE Campus, Varanasi.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <GoogleAnalytics />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
