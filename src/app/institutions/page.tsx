import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Institutions",
  description:
    "Purwanchal Educational Trust institutions — BITE, BIPE, and BIP at Babatpur, Varanasi.",
};

const institutions = [
  {
    name: "BITE",
    fullName: "Banaras Institute of Teacher's Education",
    logo: "/logos/bite-logo.svg",
    head: "Dr. Sanjay Jaiswal (Principal)",
    founded: "2003",
    programmes: "14 Programmes across UG, PG, and Professional streams",
    affiliation: "Affiliated to MGKVP (Mahatma Gandhi Kashi Vidyapith)",
    recognition: "UGC 2(f) & 12(B) recognized. NCTE/SCERT approved.",
    website: "https://bitevns.ac.in",
    tagline: "Gyaan, Sanskar, Kaushal — Where Tradition Meets Transformation",
  },
  {
    name: "BIPE",
    fullName: "Banaras Institute of Paramedical Education",
    logo: "/logos/bipe-logo.svg",
    head: "Mr. Rahul Srivastava (Principal)",
    founded: "",
    programmes: "Paramedical courses (DMLT, X-Ray Tech, OT Tech, etc.)",
    affiliation: "",
    recognition: "",
    website: "",
    tagline: "Professional Education for Healthcare Careers",
  },
  {
    name: "BIP (D.Pharm)",
    fullName: "Banaras Institute of Pharmacy",
    logo: "/logos/pharmacy-logo.svg",
    head: "Mrs. Menu (Principal)",
    founded: "",
    programmes: "Diploma in Pharmacy (D.Pharm) — 2 years after 12th",
    affiliation: "",
    recognition: "",
    website: "",
    tagline: "Excellence in Pharmaceutical Education",
  },
];

export default function InstitutionsPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-ivory to-cream px-4 pt-28 pb-16">
        <div className="mx-auto max-w-[800px] text-center">
          <h1 className="mb-4 text-[28px] font-semibold text-chocolate md:text-4xl">
            Purwanchal Educational Trust Institutions
          </h1>
          <p className="text-sm text-body">
            Three institutions under one trust, on one campus — Babatpur,
            Varanasi 221204.
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1200px] space-y-8">
          {institutions.map((inst) => (
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
                  <p>
                    <strong>Location:</strong> Babatpur, Varanasi 221204
                  </p>
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
