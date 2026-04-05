import type { Metadata } from "next";
import Image from "next/image";
import { INSTITUTIONS_LIST } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Institutions",
  description:
    "Learn about BITE, BIPE, and BIP — the institutions under Purwanchal Educational Trust, Varanasi.",
};

export default function InstitutionsPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-ivory to-cream px-4 pt-28 pb-16">
        <div className="mx-auto max-w-[800px] text-center">
          <h1 className="mb-4 text-[28px] font-semibold text-chocolate md:text-4xl">
            Our Institutions
          </h1>
          <p className="text-sm text-body">
            Purwanchal Educational Trust operates three institutions in
            Babatpur, Varanasi. This page provides factual information for
            students interested in learning more.
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1200px] space-y-8">
          {INSTITUTIONS_LIST.map((inst) => (
            <div
              key={inst.name}
              className="rounded-xl border border-gold/20 bg-ivory p-6 md:flex md:items-start md:gap-8 md:p-8"
            >
              <Image
                src={inst.logo}
                alt={inst.name}
                width={80}
                height={80}
                className="mb-4 h-16 w-auto md:mb-0 md:h-20"
              />
              <div className="flex-1">
                <h2 className="mb-1 text-xl font-semibold text-chocolate">
                  {inst.name} &mdash; {inst.fullName}
                </h2>
                <p className="mb-3 font-serif text-sm italic text-gold">
                  {inst.tagline}
                </p>
                <div className="space-y-1 text-sm text-body">
                  <p>
                    <strong>Head:</strong> {inst.head}
                  </p>
                  {inst.founded && (
                    <p>
                      <strong>Founded:</strong> {inst.founded}
                    </p>
                  )}
                  <p>
                    <strong>Programmes:</strong> {inst.programmes}
                  </p>
                  {inst.affiliation && (
                    <p>
                      <strong>Affiliation:</strong> {inst.affiliation}
                    </p>
                  )}
                  {inst.recognition && (
                    <p>
                      <strong>Recognition:</strong> {inst.recognition}
                    </p>
                  )}
                </div>
                {inst.website && (
                  <a
                    href={inst.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block rounded-lg border border-chocolate px-5 py-2 text-sm font-medium text-chocolate transition-colors hover:bg-cream"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
