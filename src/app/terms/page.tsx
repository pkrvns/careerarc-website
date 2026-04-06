import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and Conditions for CareerArc.",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <section className="bg-ivory px-4 pt-28 pb-16">
      <div className="mx-auto max-w-[800px]">
        <h1 className="mb-6 text-[28px] font-semibold text-chocolate md:text-4xl">
          Terms &amp; Conditions
        </h1>
        <div className="space-y-6 text-sm leading-relaxed text-body">
          <p>
            <strong>Effective Date:</strong> April 2026
          </p>
          <p>
            By accessing and using careerarc.academy, you agree to these Terms
            &amp; Conditions.
          </p>

          <h2 className="pt-2 text-lg font-semibold text-chocolate">
            Event Registration
          </h2>
          <ul className="ml-6 list-disc space-y-1">
            <li>
              ARC-T 2.0 is a free career guidance event. There is no fee for
              registration or attendance.
            </li>
            <li>
              Registration is subject to availability. Date allocation (Day 1 or
              Day 2) is at the discretion of CareerArc.
            </li>
            <li>
              A valid Aadhaar card is mandatory for entry to the event.
            </li>
            <li>
              CareerArc reserves the right to modify event details, schedule, or
              prizes without prior notice.
            </li>
          </ul>

          <h2 className="pt-2 text-lg font-semibold text-chocolate">
            Career Guidance Disclaimer
          </h2>
          <p>
            CareerArc provides career guidance and information. Our guidance is
            based on aptitude assessments and general career information.
            CareerArc does not guarantee any specific outcomes, admissions, or
            employment. Students and parents should make their own informed
            decisions.
          </p>

          <h2 className="pt-2 text-lg font-semibold text-chocolate">
            Intellectual Property
          </h2>
          <p>
            All content on this website, including logos, text, and graphics, is
            the property of CareerArc. Unauthorized
            reproduction or distribution is prohibited.
          </p>

          <h2 className="pt-2 text-lg font-semibold text-chocolate">
            Limitation of Liability
          </h2>
          <p>
            CareerArc shall not be liable for
            any direct or indirect damages arising from the use of this website
            or attendance at the ARC-T 2.0 event.
          </p>

          <h2 className="pt-2 text-lg font-semibold text-chocolate">
            Contact
          </h2>
          <p>
            For questions about these terms, contact us at: 91518 07551 or visit
            BITE Campus, Babatpur, Varanasi 221204.
          </p>

          <p className="pt-4 text-xs text-muted">
            &copy; 2026 CareerArc
          </p>
        </div>
      </div>
    </section>
  );
}
