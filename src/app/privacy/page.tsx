import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for CareerArc — Purwanchal Educational Trust.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <section className="bg-ivory px-4 pt-28 pb-16">
      <div className="mx-auto max-w-[800px]">
        <h1 className="mb-6 text-[28px] font-semibold text-chocolate md:text-4xl">
          Privacy Policy
        </h1>
        <div className="space-y-6 text-sm leading-relaxed text-body">
          <p>
            <strong>Effective Date:</strong> April 2026
          </p>
          <p>
            CareerArc (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or
            &ldquo;us&rdquo;), a unit of Purwanchal Educational Trust, is
            committed to protecting your privacy. This policy explains how we
            collect, use, and safeguard your information when you use our website
            at careerarc.academy.
          </p>

          <h2 className="pt-2 text-lg font-semibold text-chocolate">
            Information We Collect
          </h2>
          <p>When you register for ARC-T 2.0, we collect:</p>
          <ul className="ml-6 list-disc space-y-1">
            <li>Full name (as on Aadhaar)</li>
            <li>Mobile phone number</li>
            <li>Institution name</li>
            <li>Class/academic year</li>
            <li>Preferred event date</li>
            <li>Parent/guardian name (if provided)</li>
          </ul>

          <h2 className="pt-2 text-lg font-semibold text-chocolate">
            How We Use Your Information
          </h2>
          <ul className="ml-6 list-disc space-y-1">
            <li>To process your ARC-T 2.0 event registration</li>
            <li>To send you event-related communications via WhatsApp/SMS</li>
            <li>To generate your event QR code and date allocation</li>
            <li>To improve our career guidance services</li>
          </ul>

          <h2 className="pt-2 text-lg font-semibold text-chocolate">
            Data Sharing
          </h2>
          <p>
            We do not sell or rent your personal information to third parties.
            Your data may be shared with Sort String Solutions LLP (our
            technology partner) solely for the purpose of processing your
            registration and event management.
          </p>

          <h2 className="pt-2 text-lg font-semibold text-chocolate">
            Data Security
          </h2>
          <p>
            We implement reasonable security measures to protect your personal
            information. However, no method of transmission over the Internet is
            100% secure.
          </p>

          <h2 className="pt-2 text-lg font-semibold text-chocolate">
            Contact Us
          </h2>
          <p>
            For privacy-related inquiries, contact us at: 91518 07551 or visit
            us at BITE Campus, Babatpur, Varanasi 221204.
          </p>

          <p className="pt-4 text-xs text-muted">
            &copy; 2026 CareerArc &mdash; Purwanchal Educational Trust
          </p>
        </div>
      </div>
    </section>
  );
}
