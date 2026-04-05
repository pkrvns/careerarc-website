import Link from "next/link";
import Image from "next/image";
import { UNDERSTANDING_ZONES, SCHEDULE } from "@/lib/constants";

const stats = [
  { value: "3,014", label: "Students Tested" },
  { value: "80+", label: "Institutions" },
  { value: "13", label: "Career Zones" },
  { value: "2,000", label: "Spots Available" },
];

const prizes = [
  { icon: "💻", title: "1 Laptop", rank: "Grand Prize" },
  { icon: "📱", title: "3 Smartphones", rank: "2nd Prize" },
  { icon: "⌚", title: "5 Smart Watches", rank: "3rd Prize" },
  { icon: "🎁", title: "20+ Gift Hampers", rank: "Bonus" },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] items-center justify-center bg-gradient-to-b from-ivory to-cream px-4 pt-20 md:pt-24">
        <div className="mx-auto max-w-[800px] text-center">
          {/* Event Badge */}
          <span className="mb-6 inline-block rounded-full bg-gold/12 px-5 py-2 text-sm font-medium text-gold">
            25-26 April 2026 &mdash; BITE Campus, Varanasi
          </span>

          {/* H1 */}
          <h1 className="mb-5 text-[32px] font-semibold leading-tight text-chocolate md:text-5xl">
            Your career journey starts with understanding
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-8 max-w-xl text-[15px] leading-relaxed text-body md:text-base">
            ARC-T 2.0 Recognition &amp; Guidance Day. 13 zones. Career guidance.
            Exciting prizes. Free for all registered students.
          </p>

          {/* Buttons */}
          <div className="mb-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="w-full rounded-lg bg-coral px-8 py-3 text-base font-medium text-white transition-colors hover:bg-coral-dark sm:w-auto"
            >
              Register for Free
            </Link>
            <Link
              href="/arct2"
              className="w-full rounded-lg border border-chocolate px-8 py-3 text-base font-medium text-chocolate transition-colors hover:bg-cream sm:w-auto"
            >
              Learn More
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="border-t border-gold/30 pt-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-[28px] font-semibold text-chocolate md:text-4xl">
                    {s.value}
                  </div>
                  <div className="text-sm text-muted">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* UNDERSTANDING Journey Section */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-2 text-center text-2xl font-semibold text-chocolate md:text-[32px]">
            The UNDERSTANDING Journey
          </h2>
          <p className="mb-10 text-center text-sm text-muted">
            13 zones. 13 letters. Complete the word.
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {UNDERSTANDING_ZONES.map((zone, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-xl border border-gold/20 bg-white p-5 text-center"
              >
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg text-lg font-semibold text-white"
                  style={{ backgroundColor: zone.color }}
                >
                  {zone.letter}
                </div>
                <div className="mb-1 text-sm font-bold text-chocolate">
                  {zone.word}
                </div>
                <div className="text-xs text-muted">{zone.description}</div>
              </div>
            ))}
          </div>
          {/* Stamp tiers */}
          <div className="mt-8 rounded-xl bg-cream p-4 text-center text-sm text-brown md:text-base">
            Complete 6 stamps = Certificate &nbsp;|&nbsp; 9 stamps = Lucky Draw
            &nbsp;|&nbsp; 13 stamps = Grand Prize
          </div>
        </div>
      </section>

      {/* Prize Section */}
      <section className="bg-cream px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-8 text-center text-2xl font-semibold text-chocolate md:text-[32px]">
            Prizes Worth Winning
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {prizes.map((p) => (
              <div
                key={p.title}
                className="flex w-[140px] flex-col items-center rounded-xl border border-gold/20 bg-white p-5 text-center md:w-[180px]"
              >
                <span className="mb-2 text-4xl">{p.icon}</span>
                <div className="mb-1 text-base font-semibold text-chocolate">
                  {p.title}
                </div>
                <div className="text-xs text-gold">{p.rank}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-brown">
            How to win: Register → Visit all 13 zones → Collect stamps → Enter
            the draw!
          </p>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="bg-ivory px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-2xl font-semibold text-chocolate md:text-[32px]">
            Your 3.5-Hour Journey
          </h2>
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[60px] top-0 bottom-0 w-px border-l-2 border-dashed border-gold/40 md:left-[80px]" />
            <div className="space-y-6">
              {SCHEDULE.map((item, i) => (
                <div key={i} className="relative flex gap-4 pl-0 md:gap-6">
                  <div className="w-[60px] shrink-0 pt-1 text-right text-sm font-semibold text-gold md:w-[80px]">
                    {item.time}
                  </div>
                  <div className="relative pt-1">
                    {/* Dot */}
                    <div className="absolute -left-[13px] top-2 h-3 w-3 rounded-full border-2 border-gold bg-ivory md:-left-[15px]" />
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

      {/* Trust Section */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1200px] text-center">
          <h2 className="mb-6 text-2xl font-semibold text-chocolate md:text-[32px]">
            Backed by Legacy
          </h2>
          <div className="mx-auto mb-8 max-w-md">
            <Image
              src="/logos/pet-logo.svg"
              alt="Purwanchal Educational Trust"
              width={120}
              height={120}
              className="mx-auto mb-3 h-24 w-auto"
            />
            <p className="text-sm text-brown">
              Purwanchal Educational Trust &mdash; Est. 2000. Founded by
              visionary social reformer Late Kalika Rai. Operating BITE (est.
              2003), BIPE, and BIP. CareerArc launched 2025 as the career
              counselling wing.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                logo: "/logos/pet-logo.svg",
                name: "BITE",
                tagline: "Banaras Institute of Teacher's Education",
              },
              {
                logo: "/logos/bipe-logo.svg",
                name: "BIPE",
                tagline: "Banaras Institute of Professional Education",
              },
              {
                logo: "/logos/pharmacy-logo.svg",
                name: "BIP",
                tagline: "Banaras Institute of Pharmacy",
              },
            ].map((inst) => (
              <div
                key={inst.name}
                className="rounded-xl border border-gold/20 bg-white p-6"
              >
                <Image
                  src={inst.logo}
                  alt={inst.name}
                  width={60}
                  height={60}
                  className="mx-auto mb-3 h-14 w-auto"
                />
                <div className="font-semibold text-chocolate">{inst.name}</div>
                <div className="text-xs text-muted">{inst.tagline}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
