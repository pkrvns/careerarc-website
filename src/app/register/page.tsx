import type { Metadata } from "next";
import { RegistrationForm } from "@/components/RegistrationForm";

export const metadata: Metadata = {
  title: "Register for ARC-T 2.0",
  description:
    "Register for ARC-T 2.0 Recognition & Guidance Day — 25-26 April 2026. Free career guidance event at BITE Campus, Varanasi.",
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
            Register for ARC-T 2.0
          </h1>
          <p className="text-sm text-body">
            Recognition &amp; Guidance Day &mdash; 25-26 April 2026, BITE
            Campus, Varanasi
          </p>
        </div>
        <RegistrationForm />
      </div>
    </section>
  );
}
