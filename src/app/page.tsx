import Link from "next/link";
import Image from "next/image";
import { HOW_IT_WORKS, CAREER_STREAMS, UNDERSTANDING_ZONES, SCHEDULE } from "@/lib/constants";
import { LiveCounter } from "@/components/LiveCounter";

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
          {/* Tagline */}
          <p className="mb-4 text-2xl italic text-gold md:text-3xl" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            &ldquo;From Aptitude to Understanding&rdquo;
          </p>

          {/* H1 */}
          <h1 className="mb-5 text-[32px] font-semibold leading-tight text-chocolate md:text-5xl">
            Free Career Counselling for 3,000+ Students
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-8 max-w-xl text-[15px] leading-relaxed text-body md:text-base">
            Honest, unbiased career guidance for students in Varanasi and eastern UP.
            Book your free session, visit BITE Campus, and discover your career path.
          </p>

          {/* Buttons */}
          <div className="mb-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="w-full rounded-lg bg-coral px-8 py-3 text-base font-medium text-white transition-colors hover:bg-coral-dark sm:w-auto"
            >
              Book Your Free Session
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

      {/* How It Works Section */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="mb-2 text-center text-2xl font-semibold text-chocolate md:text-[32px]">
            How It Works
          </h2>
          <p className="mb-10 text-center text-sm text-muted">
            3 simple steps to your career clarity
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
          <div className="mt-10 text-center">
            <Link
              href="/register"
              className="inline-block rounded-lg bg-coral px-8 py-3 text-base font-medium text-white transition-colors hover:bg-coral-dark"
            >
              Book Your Free Session
            </Link>
          </div>
        </div>
      </section>

      {/* Career Streams Preview */}
      <section className="bg-cream px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-2 text-center text-2xl font-semibold text-chocolate md:text-[32px]">
            10 Career Streams
          </h2>
          <p className="mb-10 text-center text-sm text-muted">
            Explore careers across every field — find what&apos;s right for you
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-5">
            {CAREER_STREAMS.map((stream) => (
              <Link
                key={stream.name}
                href={`/streams#${stream.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex flex-col items-center rounded-xl border border-gold/20 bg-white p-5 text-center transition-shadow hover:shadow-md"
              >
                <span className="mb-2 text-3xl">{stream.icon}</span>
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
            6 stamps = Participation Certificate &nbsp;|&nbsp; 9 stamps = Lucky
            Draw Entry &nbsp;|&nbsp; 13 stamps = GRAND PRIZE Draw Entry
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
            How to win: Register &rarr; Visit all 13 zones &rarr; Collect stamps &rarr; Enter
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
          <div className="space-y-5">
            {SCHEDULE.map((item, i) => (
              <div key={i} className="flex items-start gap-3 md:gap-4">
                <div className="w-[70px] shrink-0 rounded-lg bg-gold/10 px-2 py-1.5 text-center text-xs font-semibold text-gold md:w-[80px] md:text-sm">
                  {item.time}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold text-chocolate">
                    {item.title}
                  </div>
                  <div className="text-sm text-muted">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Venue Section */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="mb-6 text-2xl font-semibold text-chocolate md:text-[32px]">
            Event Venue
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
          <p className="mb-8 text-white/80">
            Free for all students. No hidden fees. Just honest guidance.
          </p>
          <Link
            href="/register"
            className="inline-block rounded-lg bg-white px-10 py-3.5 text-base font-semibold text-coral transition-colors hover:bg-cream"
          >
            Book Your Free Session
          </Link>
        </div>
      </section>
    </>
  );
}
