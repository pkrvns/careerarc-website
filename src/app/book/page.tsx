import type { Metadata } from "next";
import { RegistrationTabs } from "@/components/RegistrationTabs";

export const metadata: Metadata = {
  title: "Get Your FREE Career Kit + Personal Guidance",
  description:
    "Book your Career Planning Session — FREE. Get your Career Kit at BITE Campus, Varanasi. Honest, unbiased career guidance for students.",
};

export default function BookPage() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-ivory to-cream px-4 pt-24 pb-16">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-block rounded-full bg-gold/12 px-4 py-1.5 text-sm font-medium text-gold">
            Free Registration
          </span>
          <h1 className="mb-2 text-[28px] font-semibold text-chocolate md:text-4xl">
            Get Your FREE Career Kit
          </h1>
          <p className="text-sm text-body">
            Book your Career Planning Session — FREE.
            Pick your date, bring your Aadhaar, and get your Career Kit.
          </p>
          <p className="mt-2 text-xs italic text-gold">
            Apna session book karein — bilkul FREE
          </p>
        </div>
        <RegistrationTabs />
      </div>
    </section>
  );
}
