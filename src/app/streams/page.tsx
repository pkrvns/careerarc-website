import type { Metadata } from "next";
import Link from "next/link";
import { CAREER_STREAMS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Career Streams",
  description:
    "Explore 10 career streams — Science, Engineering, IT, Arts, Teaching, Medical, Commerce, Government, Vocational, and Emerging careers. Free career guidance at CareerArc.",
};

export default function StreamsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-ivory to-cream px-4 pt-28 pb-16">
        <div className="mx-auto max-w-[800px] text-center">
          <h1 className="mb-4 text-[28px] font-semibold text-chocolate md:text-4xl">
            Career Streams
          </h1>
          <p className="text-sm text-body md:text-base">
            Explore careers across 10 fields. Each stream includes career options,
            salary ranges, educational pathways, and key exams. Not sure where you
            fit? Book a free career guidance session.
          </p>
        </div>
      </section>

      {/* Stream Cards */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1100px] space-y-8">
          {CAREER_STREAMS.map((stream) => (
            <div
              key={stream.name}
              id={stream.name.toLowerCase().replace(/\s+/g, "-")}
              className="scroll-mt-24 overflow-hidden rounded-xl border border-gold/20 bg-white"
            >
              {/* Stream Header */}
              <div
                className="flex items-center gap-4 px-6 py-4"
                style={{ backgroundColor: stream.color + "12" }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: stream.color }}>
                  {stream.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-chocolate">{stream.name}</h2>
                  <span className="text-sm font-medium" style={{ color: stream.color }}>
                    {stream.salaryRange}
                  </span>
                </div>
              </div>

              {/* Stream Content */}
              <div className="grid gap-6 p-6 md:grid-cols-3">
                {/* Careers */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
                    Career Options
                  </h3>
                  <ul className="space-y-1.5">
                    {stream.careers.map((career) => (
                      <li key={career} className="flex items-center gap-2 text-sm text-body">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: stream.color }} />
                        {career}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pathway */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
                    Educational Pathway
                  </h3>
                  <p className="text-sm leading-relaxed text-body">{stream.pathway}</p>
                </div>

                {/* Exams */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
                    Key Exams
                  </h3>
                  <p className="text-sm text-body">{stream.exams}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream px-4 py-16 text-center md:py-20">
        <div className="mx-auto max-w-[600px]">
          <h2 className="mb-4 text-2xl font-semibold text-chocolate md:text-[32px]">
            Not Sure Which Stream is Right for You?
          </h2>
          <p className="mb-6 text-sm text-body">
            Book a free career guidance session and get your Career Kit with personalised
            guidance based on your aptitude, interests, and goals.
          </p>
          <Link
            href="/book"
            className="inline-block rounded-lg bg-coral px-8 py-3 text-base font-medium text-white transition-colors hover:bg-coral-dark"
          >
            Book Your Free Session
          </Link>
        </div>
      </section>
    </>
  );
}
