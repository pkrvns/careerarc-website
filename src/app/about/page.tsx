import type { Metadata } from "next";
import Image from "next/image";
import { LEADERSHIP } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About CareerArc",
  description:
    "CareerArc is a career counselling initiative empowering students in Varanasi and eastern UP with guidance, confidence, and direction.",
};

export default function AboutPage() {
  return (
    <>
      {/* CareerArc Story */}
      <section className="bg-gradient-to-b from-ivory to-cream px-4 pt-28 pb-16">
        <div className="mx-auto max-w-[800px] text-center">
          <h1 className="mb-6 text-[28px] font-semibold text-chocolate md:text-4xl">
            About CareerArc
          </h1>
          <p className="mb-4 leading-relaxed text-body">
            Launched in 2025, CareerArc is a career counselling initiative that
            empowers students &mdash; especially from rural and underprivileged
            backgrounds in Varanasi and eastern Uttar Pradesh &mdash; with the
            knowledge, confidence, and direction they need to choose the right
            career path.
          </p>
          <p className="leading-relaxed text-body">
            We believe every student deserves access to honest, unbiased career
            guidance. We don&apos;t sell admissions. We don&apos;t push courses.
            We help students understand their own aptitudes, explore career
            options they may never have heard of, and build a concrete plan to
            get there.
          </p>
          <p className="mt-6 font-serif text-lg italic text-gold">
            &ldquo;From Aptitude to Understanding&rdquo;
          </p>
        </div>
      </section>

      {/* Venue */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="mb-6 text-2xl font-semibold text-chocolate md:text-[32px]">
            Event Venue
          </h2>
          <div className="rounded-xl border border-gold/20 bg-ivory p-8">
            <Image
              src="/logos/bite-logo.svg"
              alt="BITE"
              width={100}
              height={100}
              className="mx-auto mb-4 h-20 w-auto"
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

      {/* Leadership */}
      <section className="bg-ivory px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-8 text-center text-2xl font-semibold text-chocolate md:text-[32px]">
            Team
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {LEADERSHIP.map((person) => (
              <div
                key={person.name}
                className="flex items-center gap-4 rounded-xl border border-gold/20 bg-white p-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10 text-sm font-semibold text-gold">
                  {person.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-chocolate">
                    {person.name}
                  </div>
                  <div className="text-xs text-brown">{person.designation}</div>
                  <div className="text-xs text-muted">{person.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Partner */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[600px] text-center">
          <p className="mb-4 text-xs uppercase tracking-wider text-muted">
            Technology Partner
          </p>
          <a
            href="https://sortstring.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/logos/sortstring-logo.png"
              alt="Sort String Solutions LLP"
              width={220}
              height={60}
              className="mx-auto mb-4 h-12 w-auto"
            />
          </a>
          <p className="text-sm text-body">
            Sort String Solutions LLP is our technology partner, powering the
            CareerArc website, registration system, and event management
            platform.
          </p>
          <a
            href="https://sortstring.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-gold transition-colors hover:text-gold-dark"
          >
            sortstring.com &rarr;
          </a>
        </div>
      </section>
    </>
  );
}
