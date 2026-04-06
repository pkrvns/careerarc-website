import type { Metadata } from "next";
import { PHONE_NUMBERS, WHATSAPP_LINK, SOCIAL_LINKS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with CareerArc. Phone, WhatsApp, and visit us at BITE Campus, Babatpur, Varanasi 221204.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-ivory to-cream px-4 pt-28 pb-16">
        <div className="mx-auto max-w-[800px] text-center">
          <h1 className="mb-4 text-[28px] font-semibold text-chocolate md:text-4xl">
            Contact Us
          </h1>
          <p className="text-sm text-body">
            Have questions? We&apos;re here to help. Reach out via phone,
            WhatsApp, or visit us at BITE Campus.
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto grid max-w-[1200px] gap-8 md:grid-cols-2">
          {/* Contact Info */}
          <div>
            <h2 className="mb-6 text-xl font-semibold text-chocolate">
              Get in Touch
            </h2>

            {/* Phone Numbers */}
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-muted">
                Phone
              </h3>
              <div className="space-y-2">
                {PHONE_NUMBERS.map((p) => (
                  <a
                    key={p.tel}
                    href={`tel:${p.tel}`}
                    className="flex items-center gap-3 text-lg font-semibold text-chocolate transition-colors hover:text-gold"
                  >
                    <svg
                      className="h-5 w-5 text-gold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {p.display}
                  </a>
                ))}
              </div>
            </div>

            {/* WhatsApp */}
            <div className="mb-6">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.11 1.519 5.837L0 24l6.335-1.652A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.86 0-3.63-.505-5.17-1.42l-.37-.22-3.848 1.008 1.025-3.747-.242-.384A9.79 9.79 0 012.182 12c0-5.42 4.398-9.818 9.818-9.818S21.818 6.58 21.818 12s-4.398 9.818-9.818 9.818z" />
                </svg>
                Chat with us on WhatsApp
              </a>
            </div>

            {/* Social */}
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-muted">
                Social Media
              </h3>
              <div className="flex flex-col gap-2">
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brown transition-colors hover:text-gold"
                >
                  @careerarc_academy (Instagram)
                </a>
                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brown transition-colors hover:text-gold"
                >
                  CareerArc (Facebook)
                </a>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-muted">
                Address
              </h3>
              <p className="text-sm text-body">
                BITE Campus, Babatpur
                <br />
                Varanasi 221204
                <br />
                Uttar Pradesh, India
              </p>
              <div className="mt-3 space-y-1 text-xs text-muted">
                <p>From Varanasi Cantt: ~35 min</p>
                <p>From Babatpur Airport: ~5 min</p>
                <p>From BHU: ~40 min</p>
              </div>
            </div>
          </div>

          {/* Google Map */}
          <div className="overflow-hidden rounded-xl border border-gold/20">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3604.5!2d82.8639!3d25.4528!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDI3JzEwLjEiTiA4MsKwNTEnNTAuMCJF!5e0!3m2!1sen!2sin!4v1"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="BITE Campus, Babatpur, Varanasi"
            />
          </div>
        </div>
      </section>
    </>
  );
}
