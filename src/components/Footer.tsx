import Link from "next/link";
import Image from "next/image";
import { PHONE_NUMBERS, SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer>
      {/* Pre-footer CTA */}
      <section className="bg-cream px-4 py-12 text-center">
        <h2 className="mb-4 text-2xl font-semibold text-chocolate md:text-3xl">
          Ready to begin your journey?
        </h2>
        <Link
          href="/register"
          className="inline-block rounded-lg bg-coral px-8 py-3 text-base font-medium text-white transition-colors hover:bg-coral-dark"
        >
          Register Now
        </Link>
        <p className="mt-3 text-sm text-muted">
          or{" "}
          <a
            href="https://wa.me/919151807551"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline"
          >
            join our WhatsApp Community
          </a>
        </p>
      </section>

      {/* Main Footer */}
      <div className="bg-chocolate px-4 py-12 text-tan">
        <div className="mx-auto grid max-w-[1200px] gap-8 md:grid-cols-[2fr_1fr]">
          {/* Column 1 */}
          <div>
            <h3 className="mb-1 text-lg font-semibold text-gold-light">
              CareerArc
            </h3>
            <p className="mb-3 text-sm text-tan">
              Career Guidance for Every Student
            </p>
            <p className="mb-4 text-sm text-tan">
              Babatpur, Varanasi 221204
              <br />
              Uttar Pradesh, India
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              {PHONE_NUMBERS.map((p) => (
                <a
                  key={p.tel}
                  href={`tel:${p.tel}`}
                  className="text-gold-light transition-colors hover:text-gold"
                >
                  {p.display}
                </a>
              ))}
            </div>
            {/* Social Icons */}
            <div className="mt-5 flex gap-4">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-tan transition-colors hover:text-gold-light"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-tan transition-colors hover:text-gold-light"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {SOCIAL_LINKS.twitter && (
                <a
                  href={SOCIAL_LINKS.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="text-tan transition-colors hover:text-gold-light"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-gold-light">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "About", href: "/about" },
                { label: "ARC-T 2.0", href: "/arct2" },
                { label: "Register", href: "/register" },
                { label: "Contact", href: "/contact" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-tan transition-colors hover:text-gold-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Technology Partner */}
        <div className="mx-auto mt-10 max-w-[1200px] border-t border-brown pt-6">
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs uppercase tracking-wider text-tan/60">
              Technology Partner
            </p>
            <a
              href="https://sortstring.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/logos/sortstring-logo-white.png"
                alt="Sort String Solutions LLP"
                width={160}
                height={40}
                className="h-8 w-auto opacity-80 transition-opacity hover:opacity-100"
              />
            </a>
          </div>
          <p className="mt-4 text-center text-xs text-tan/50">
            &copy; 2026 CareerArc. All rights reserved.
            <span className="mx-2">|</span>
            <Link href="/admin" className="text-tan/30 transition-colors hover:text-tan/60">
              Admin
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
