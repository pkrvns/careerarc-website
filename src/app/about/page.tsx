import type { Metadata } from "next";
import Image from "next/image";
import { LEADERSHIP } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About CareerArc",
  description:
    "CareerArc is the official career counselling wing of Purwanchal Educational Trust, empowering students in Varanasi and eastern UP.",
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
            Launched in 2025, CareerArc is the official career counselling wing
            of Purwanchal Educational Trust. We exist to bridge the gap between
            education and employment &mdash; especially for students from rural
            and underprivileged backgrounds in Varanasi and eastern Uttar
            Pradesh.
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

      {/* Purwanchal Educational Trust */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[800px] text-center">
          <Image
            src="/logos/pet-logo.svg"
            alt="Purwanchal Educational Trust"
            width={140}
            height={140}
            className="mx-auto mb-4 h-28 w-auto"
          />
          <h2 className="mb-4 text-2xl font-semibold text-chocolate md:text-[32px]">
            Purwanchal Educational Trust
          </h2>
          <p className="mb-2 text-sm font-medium text-gold">
            Established 2nd November 2000
          </p>
          <p className="leading-relaxed text-body">
            Founded by visionary social reformer <strong>Late Kalika Rai</strong>,
            the trust was born from a belief that quality education should be
            accessible to all, regardless of economic background. Today, it
            operates three institutions: BITE (est. 2003), BIPE, and BIP
            (D.Pharm).
          </p>
        </div>
      </section>

      {/* Leadership */}
      <section className="bg-ivory px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-8 text-center text-2xl font-semibold text-chocolate md:text-[32px]">
            Leadership
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {LEADERSHIP.map((person) => (
              <div
                key={person.name}
                className="flex items-center gap-4 rounded-xl border border-gold/20 bg-white p-5"
              >
                {/* Initials circle */}
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
          <p className="mt-6 text-center text-sm text-muted">
            Technology Partner: Sort String Solutions LLP (Abhishek Mishra, CTO)
          </p>
        </div>
      </section>
    </>
  );
}
