import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { HOW_IT_WORKS, CAREER_STREAMS } from "@/lib/constants";
import { LiveCounter } from "@/components/LiveCounter";

export const metadata: Metadata = {
  title: "CareerArc — Free Career Kit + Personal Guidance for 3,000+ Students",
  description:
    "Get your FREE Career Kit and personal career guidance at CareerArc. Honest, unbiased career guidance for students in Varanasi and eastern UP. BITE Campus.",
};

const JOURNEY_STEPS = [
  { step: 1, title: "Gate + Aadhaar", desc: "Check in with your Aadhaar card and get your QR code scanned.", hindi: "Aadhaar dikhao, entry lo" },
  { step: 2, title: "RIASEC Test", desc: "Take a quick career aptitude quiz to discover your strengths.", hindi: "Apni strength jaano" },
  { step: 3, title: "Career Guidance", desc: "Meet your Career Guide for a personalised one-on-one session.", hindi: "Apne Guide se milo" },
  { step: 4, title: "Career Kit", desc: "Collect your FREE Career Kit — bag, notebook, report, plan, and more.", hindi: "Apna Career Kit lo" },
  { step: 5, title: "Selfie Booth", desc: "Celebrate at the selfie booth and share your experience!", hindi: "Photo khichwao, share karo" },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] items-center justify-center bg-gradient-to-b from-ivory to-cream px-4 pt-20 md:pt-24">
        <div className="mx-auto max-w-[800px] text-center">
          {/* Tagline */}
          <p className="mb-4 text-2xl italic text-gold md:text-3xl" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            &ldquo;From Aptitude to Understanding&rdquo;
          </p>

          {/* H1 */}
          <h1 className="mb-5 text-[32px] font-semibold leading-tight text-chocolate md:text-5xl">
            Get Your FREE Career Kit + Personal Guidance
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-2 max-w-xl text-[15px] leading-relaxed text-body md:text-base">
            Honest, unbiased career guidance for 3,000+ students in Varanasi and eastern UP.
            Book your free session, visit BITE Campus, and get your Career Kit — bag, notebook, report card, career plan, handouts, scholarship guide, and certificate.
          </p>
          <p className="mx-auto mb-8 max-w-xl text-sm italic text-gold">
            Apna Career Plan banvaiye — BILKUL FREE.
          </p>

          {/* Buttons */}
          <div className="mb-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/book"
              className="w-full rounded-lg bg-coral px-8 py-3 text-base font-medium text-white transition-colors hover:bg-coral-dark sm:w-auto"
            >
              Get Your Free Career Kit
            </Link>
            <Link
              href="/streams"
              className="w-full rounded-lg border border-chocolate px-8 py-3 text-base font-medium text-chocolate transition-colors hover:bg-cream sm:w-auto"
            >
              Explore Career Streams
            </Link>
          </div>

          {/* Live Counter */}
          <LiveCounter />
        </div>
      </section>

      {/* Career Kit Section — Elevated to right after hero */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="mb-2 text-center text-2xl font-semibold text-chocolate md:text-[32px]">
            Your FREE Career Kit
          </h2>
          <p className="mb-2 text-center text-sm text-muted">
            Every student gets a complete Career Kit — absolutely free
          </p>
          <p className="mb-10 text-center text-sm italic text-gold">
            Har student ko milega — poora Career Kit, bilkul FREE
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { letter: "T", item: "CareerArc Tote Bag" },
              { letter: "N", item: "Notebook + Pen" },
              { letter: "R", item: "RIASEC Report Card" },
              { letter: "P", item: "Career Pathway Card" },
              { letter: "H", item: "2 Stream Handouts" },
              { letter: "S", item: "Scholarship Guide" },
              { letter: "A", item: "90-Day Action Plan" },
              { letter: "C", item: "Personalized Certificate" },
            ].map((k) => (
              <div key={k.item} className="flex flex-col items-center rounded-xl border border-gold/20 bg-white p-5 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-sm font-semibold text-gold">
                  {k.letter}
                </div>
                <span className="text-xs font-medium text-chocolate">{k.item}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/book"
              className="inline-block rounded-lg bg-coral px-8 py-3 text-base font-medium text-white transition-colors hover:bg-coral-dark"
            >
              Get Your Free Career Kit
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-cream px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="mb-2 text-center text-2xl font-semibold text-chocolate md:text-[32px]">
            How It Works
          </h2>
          <p className="mb-2 text-center text-sm text-muted">
            3 simple steps to your career clarity
          </p>
          <p className="mb-10 text-center text-sm italic text-gold">
            3 aasan steps mein career guidance paayein
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-2xl font-bold text-gold">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-chocolate">{item.title}</h3>
                <p className="text-sm text-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your 45-Minute Journey — Replaces old 3.5-hour / UNDERSTANDING / stamps */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="mb-2 text-center text-2xl font-semibold text-chocolate md:text-[32px]">
            Your 45-Minute Journey
          </h2>
          <p className="mb-2 text-center text-sm text-muted">
            Gate to Career Kit in 5 simple steps
          </p>
          <p className="mb-10 text-center text-sm italic text-gold">
            Gate se Career Kit tak — 45 minute mein
          </p>
          <div className="grid gap-6 md:grid-cols-5">
            {JOURNEY_STEPS.map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-coral/10 text-lg font-bold text-coral">
                  {s.step}
                </div>
                <h3 className="mb-1 text-sm font-semibold text-chocolate">{s.title}</h3>
                <p className="text-xs text-body">{s.desc}</p>
                <p className="mt-1 text-xs italic text-gold">{s.hindi}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Streams Preview */}
      <section className="bg-cream px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-2 text-center text-2xl font-semibold text-chocolate md:text-[32px]">
            10 Career Streams
          </h2>
          <p className="mb-2 text-center text-sm text-muted">
            Explore careers across every field — find what&apos;s right for you
          </p>
          <p className="mb-10 text-center text-sm italic text-gold">
            Apne liye sahi career dhundhiye
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-5">
            {CAREER_STREAMS.map((stream) => (
              <Link
                key={stream.name}
                href={`/streams#${stream.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex flex-col items-center rounded-xl border border-gold/20 bg-white p-5 text-center transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: stream.color }}>
                  {stream.name.charAt(0)}
                </div>
                <div className="mb-1 text-sm font-semibold text-chocolate">{stream.name}</div>
                <div className="text-xs text-gold">{stream.salaryRange}</div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/streams"
              className="text-sm font-medium text-gold transition-colors hover:text-gold-dark"
            >
              View all streams with career details &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Venue Section */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="mb-6 text-2xl font-semibold text-chocolate md:text-[32px]">
            Venue
          </h2>
          <div className="rounded-xl border border-gold/20 bg-ivory p-8">
            <Image
              src="/logos/bite-logo.svg"
              alt="BITE"
              width={80}
              height={80}
              className="mx-auto mb-4 h-16 w-auto"
            />
            <h3 className="mb-2 text-xl font-semibold text-chocolate">
              BITE Campus
            </h3>
            <p className="mb-1 font-serif text-sm italic text-gold">
              Banaras Institute of Teacher&apos;s Education
            </p>
            <p className="text-sm text-body">
              Babatpur, Varanasi 221204, Uttar Pradesh
            </p>
            <p className="mt-2 text-xs text-muted">
              Daily sessions: 2:00 PM &ndash; 4:00 PM
            </p>
          </div>
        </div>
      </section>

      {/* Ethics Section */}
      <section className="bg-ivory px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[700px] text-center">
          <h2 className="mb-4 text-2xl font-semibold text-chocolate md:text-[32px]">
            Our Ethics Pledge
          </h2>
          <p className="mb-4 text-body leading-relaxed">
            We don&apos;t sell admissions. We don&apos;t push courses.
            We provide honest, unbiased career guidance for every student.
          </p>
          <p className="font-serif text-lg italic text-gold">
            &ldquo;We recommend BHU if BHU is right for you.&rdquo;
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-coral px-4 py-16 text-center md:py-20">
        <div className="mx-auto max-w-[600px]">
          <h2 className="mb-4 text-2xl font-semibold text-white md:text-[32px]">
            Ready to Discover Your Career Path?
          </h2>
          <p className="mb-2 text-white/80">
            Free for all students. No hidden fees. Just honest guidance.
          </p>
          <p className="mb-8 text-sm italic text-white/70">
            Sabhi students ke liye FREE. Koi fees nahi.
          </p>
          <Link
            href="/book"
            className="inline-block rounded-lg bg-white px-10 py-3.5 text-base font-semibold text-coral transition-colors hover:bg-cream"
          >
            Get Your Free Career Kit
          </Link>
        </div>
      </section>
    </>
  );
}
