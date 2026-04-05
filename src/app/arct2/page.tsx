import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { UNDERSTANDING_ZONES, SCHEDULE, FAQS } from "@/lib/constants";
import { FAQAccordion } from "@/components/FAQAccordion";

export const metadata: Metadata = {
  title: "ARC-T 2.0 — Recognition & Guidance Day",
  description:
    "ARC-T 2.0 Recognition & Guidance Day. 25-26 April 2026, BITE Campus, Varanasi. 13 career zones, prizes, free career guidance.",
};

export default function ArctPage() {
  return (
    <>
      {/* Event Hero */}
      <section className="bg-gradient-to-b from-ivory to-cream px-4 pt-28 pb-16 text-center">
        <Image
          src="/logos/arct-logo.svg"
          alt="ARC-T 2.0"
          width={280}
          height={120}
          className="mx-auto mb-6 h-24 w-auto md:h-32"
          priority
        />
        <h1 className="mb-2 text-2xl font-semibold text-chocolate md:text-4xl">
          Recognition &amp; Guidance Day
        </h1>
        <span className="mb-3 inline-block rounded-full bg-gold/12 px-5 py-2 text-sm font-medium text-gold">
          25-26 April 2026 (Sat-Sun)
        </span>
        <p className="text-sm text-body">
          BITE Campus, Babatpur, Varanasi &bull; 2:00 PM &ndash; 5:30 PM
        </p>
        <div className="mt-6">
          <Link
            href="/register"
            className="inline-block rounded-lg bg-coral px-8 py-3 font-medium text-white transition-colors hover:bg-coral-dark"
          >
            Register for Free
          </Link>
        </div>
      </section>

      {/* What is ARC-T? */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-6 text-center text-2xl font-semibold text-chocolate md:text-[32px]">
            What is ARC-T?
          </h2>
          <p className="mb-4 leading-relaxed text-body">
            ARC-T stands for <strong>Aptitude &amp; Reasoning Challenge Test</strong>.
            Phase 1 was a competitive aptitude exam conducted across 80+
            institutions in Varanasi and eastern UP. 4,972 students registered,
            and 3,014 appeared and completed the exam.
          </p>
          <p className="mb-6 leading-relaxed text-body">
            ARC-T 2.0 (Phase 2) is the <strong>Recognition &amp; Guidance Day</strong> &mdash;
            a free event on 25-26 April 2026 at BITE Campus, Babatpur,
            Varanasi. Top 2,000 students (by rank) are invited for career
            guidance, RIASEC profiling, prizes, and the UNDERSTANDING stamp
            journey across 13 zones.
          </p>
          <p className="text-center font-serif text-lg italic text-gold md:text-xl">
            &ldquo;ARC-T doesn&apos;t choose for you. It helps you choose better.&rdquo;
          </p>
        </div>
      </section>

      {/* UNDERSTANDING Zones Detailed */}
      <section className="bg-ivory px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-2 text-center text-2xl font-semibold text-chocolate md:text-[32px]">
            The UNDERSTANDING Zones
          </h2>
          <p className="mb-10 text-center text-sm text-muted">
            13 zones. 13 letters. Complete the word to win.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {UNDERSTANDING_ZONES.map((zone, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-xl border border-gold/20 bg-white p-5"
                style={{ borderLeftWidth: "3px", borderLeftColor: zone.color }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-semibold text-white"
                  style={{ backgroundColor: zone.color }}
                >
                  {zone.letter}
                </div>
                <div>
                  <div className="mb-1 font-semibold text-chocolate">
                    {zone.word}
                  </div>
                  <div className="text-sm text-muted">{zone.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-2xl font-semibold text-chocolate md:text-[32px]">
            Event Schedule
          </h2>
          <div className="relative">
            <div className="absolute left-[60px] top-0 bottom-0 w-px border-l-2 border-dashed border-gold/40 md:left-[80px]" />
            <div className="space-y-6">
              {SCHEDULE.map((item, i) => (
                <div key={i} className="relative flex gap-4 md:gap-6">
                  <div className="w-[60px] shrink-0 pt-1 text-right text-sm font-semibold text-gold md:w-[80px]">
                    {item.time}
                  </div>
                  <div className="relative pt-1">
                    <div className="absolute -left-[13px] top-2 h-3 w-3 rounded-full border-2 border-gold bg-white md:-left-[15px]" />
                    <div className="font-semibold text-chocolate">
                      {item.title}
                    </div>
                    <div className="text-sm text-muted">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Prizes Detailed */}
      <section className="bg-cream px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="mb-6 text-2xl font-semibold text-chocolate md:text-[32px]">
            Prizes
          </h2>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: "💻", title: "1 Laptop", rank: "Grand Prize" },
              { icon: "📱", title: "3 Smartphones", rank: "2nd Prize" },
              { icon: "⌚", title: "5 Smart Watches", rank: "3rd Prize" },
              { icon: "🎁", title: "20+ Hampers", rank: "Bonus" },
            ].map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-gold/20 bg-white p-4"
              >
                <span className="mb-2 block text-3xl">{p.icon}</span>
                <div className="text-sm font-semibold text-chocolate">
                  {p.title}
                </div>
                <div className="text-xs text-gold">{p.rank}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-white p-4 text-sm text-brown">
            <strong>Stamp tiers:</strong> 6 stamps = Participation Certificate
            &bull; 9 stamps = Lucky Draw Entry &bull; 13 stamps = Grand Prize
            Draw
          </div>
        </div>
      </section>

      {/* For Parents */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-6 text-center text-2xl font-semibold text-chocolate md:text-[32px]">
            Dear Parents / Guardians
          </h2>
          <div className="rounded-xl border border-gold/20 bg-ivory p-6 md:p-8">
            <p className="mb-4 leading-relaxed text-body">
              This is a <strong>FREE career guidance event</strong>. Your child
              was selected based on their aptitude test results from ARC-T Phase
              1. Parent passes are available &mdash; you can attend too!
            </p>
            <ul className="mb-4 space-y-2 text-sm text-body">
              <li className="flex gap-2">
                <span className="text-gold">✓</span> Dedicated parent room with
                AC, seating, career briefing, refreshments
              </li>
              <li className="flex gap-2">
                <span className="text-gold">✓</span> Join the prize ceremony at
                4:45 PM with your child
              </li>
              <li className="flex gap-2">
                <span className="text-gold">✓</span> Parent passes available at
                the gate — separate entry queue
              </li>
              <li className="flex gap-2">
                <span className="text-gold">✓</span> No registration needed for
                parents (but preferred for planning)
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-ivory px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-2xl font-semibold text-chocolate md:text-[32px]">
            Frequently Asked Questions
          </h2>
          <FAQAccordion faqs={FAQS} />
        </div>
      </section>
    </>
  );
}
