import type { Metadata } from "next";
import { RegistrationTabs } from "@/components/RegistrationTabs";

export const metadata: Metadata = {
  title: "Book Your Free Session",
  description:
    "Get your free Career Kit + personal career guidance at CareerArc. ARC-T 2.0 Recognition & Guidance Day — 25-26 April 2026, BITE Campus, Varanasi.",
};

export default function RegisterPage() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-ivory to-cream px-4 pt-24 pb-16">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-block rounded-full bg-gold/12 px-4 py-1.5 text-sm font-medium text-gold">
            Free Registration
          </span>
          <h1 className="mb-2 text-[28px] font-semibold text-chocolate md:text-4xl">
            Book Your Free Session
          </h1>
          <p className="text-sm text-body">
            Career guidance at BITE Campus, Varanasi.
            Pick your date, bring your Aadhaar, and get your FREE Career Kit.
          </p>
        </div>
        <RegistrationTabs />
      </div>
    </section>
  );
}
