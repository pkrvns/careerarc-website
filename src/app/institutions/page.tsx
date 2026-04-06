import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Event Venue",
  description:
    "CareerArc event venue — BITE Campus, Babatpur, Varanasi 221204.",
};

export default function InstitutionsPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-ivory to-cream px-4 pt-28 pb-16">
        <div className="mx-auto max-w-[800px] text-center">
          <h1 className="mb-4 text-[28px] font-semibold text-chocolate md:text-4xl">
            Event Venue
          </h1>
          <p className="text-sm text-body">
            CareerArc is hosted at the BITE Campus in Babatpur, Varanasi 221204.
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="rounded-xl border border-gold/20 bg-ivory p-6 md:flex md:items-start md:gap-8 md:p-8">
            <Image
              src="/logos/bite-logo.svg"
              alt="BITE"
              width={80}
              height={80}
              className="mb-4 h-16 w-auto md:mb-0 md:h-20"
            />
            <div className="flex-1">
              <h2 className="mb-1 text-xl font-semibold text-chocolate">
                BITE &mdash; Banaras Institute of Teacher&apos;s Education
              </h2>
              <p className="mb-3 font-serif text-sm italic text-gold">
                Gyaan, Sanskar, Kaushal &mdash; Where Tradition Meets
                Transformation
              </p>
              <div className="space-y-1 text-sm text-body">
                <p>
                  <strong>Principal:</strong> Dr. Sanjay Jaiswal
                </p>
                <p>
                  <strong>Founded:</strong> 2003
                </p>
                <p>
                  <strong>Programmes:</strong> 14 Programmes across UG, PG, and
                  Professional streams
                </p>
                <p>
                  <strong>Affiliation:</strong> Affiliated to MGKVP (Mahatma
                  Gandhi Kashi Vidyapith)
                </p>
                <p>
                  <strong>Recognition:</strong> UGC 2(f) &amp; 12(B) recognized.
                  NCTE/SCERT approved.
                </p>
                <p>
                  <strong>Location:</strong> Babatpur, Varanasi 221204
                </p>
              </div>
              <a
                href="https://bitevns.ac.in"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-lg border border-chocolate px-5 py-2 text-sm font-medium text-chocolate transition-colors hover:bg-cream"
              >
                Visit Website
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
