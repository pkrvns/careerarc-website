import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
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
    "CareerArc — Free Career Kit + personal career guidance for students in Varanasi and eastern UP. BITE Campus.",
  metadataBase: new URL("https://careerarc.academy"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://careerarc.academy",
    siteName: "CareerArc",
    title: "CareerArc — Career Guidance for Varanasi Students",
    description:
      "Free Career Kit + personal career guidance for 3,000+ students. BITE Campus, Varanasi.",
    images: [{ url: "/logos/arct-logo.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerArc — Career Guidance for Varanasi Students",
    description:
      "Free Career Kit + personal career guidance. BITE Campus, Varanasi.",
  },
  robots: { index: true, follow: true },
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
        <WhatsAppButton />
      </body>
    </html>
  );
}
