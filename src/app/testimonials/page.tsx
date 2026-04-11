import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Hear from students who attended CareerArc career guidance sessions. Real stories, real impact.",
};

export default function TestimonialsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-ivory to-cream px-4 pt-28 pb-16">
        <div className="mx-auto max-w-[800px] text-center">
          <h1 className="mb-4 text-[28px] font-semibold text-chocolate md:text-4xl">
            Student Testimonials
          </h1>
          <p className="text-sm text-body md:text-base">
            Real stories from students who discovered their career path at CareerArc.
          </p>
        </div>
      </section>

      {/* Coming Soon / Placeholder */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[900px]">
          <div className="rounded-xl border border-gold/20 bg-ivory p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
              <svg className="h-7 w-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
            </div>
            <h2 className="mb-3 text-xl font-semibold text-chocolate">
              Video Testimonials Coming Soon
            </h2>
            <p className="mx-auto mb-6 max-w-md text-sm text-body">
              We&apos;re collecting video testimonials from students during the CareerArc
              programme. Check back soon to hear their stories.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="rounded-lg border border-gold/20 bg-white px-6 py-4 text-center">
                <div className="text-2xl font-bold text-gold">9.1</div>
                <div className="text-xs text-muted">Avg NPS Score</div>
              </div>
              <div className="rounded-lg border border-gold/20 bg-white px-6 py-4 text-center">
                <div className="text-2xl font-bold text-gold">8.7</div>
                <div className="text-xs text-muted">Avg Rating</div>
              </div>
              <div className="rounded-lg border border-gold/20 bg-white px-6 py-4 text-center">
                <div className="text-2xl font-bold text-gold">3,014</div>
                <div className="text-xs text-muted">Students</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream px-4 py-16 text-center md:py-20">
        <div className="mx-auto max-w-[600px]">
          <h2 className="mb-4 text-2xl font-semibold text-chocolate md:text-[32px]">
            Be Part of the Story
          </h2>
          <p className="mb-6 text-sm text-body">
            Book your free career guidance session and get your Career Kit today.
          </p>
          <Link
            href="/book"
            className="inline-block rounded-lg bg-coral px-8 py-3 text-base font-medium text-white transition-colors hover:bg-coral-dark"
          >
            Get Your Free Career Kit
          </Link>
        </div>
      </section>
    </>
  );
}
