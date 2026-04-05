"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { NAV_LINKS, PHONE_NUMBERS, WHATSAPP_LINK } from "@/lib/constants";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-ivory shadow-md"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logos/careerarc-logo.svg"
            alt="CareerArc"
            width={140}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-normal text-brown transition-colors hover:text-chocolate"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <Link
          href="/register"
          className="hidden rounded-full bg-gold px-5 py-2 text-[15px] font-medium text-white transition-colors hover:bg-gold-dark md:inline-block"
        >
          Register Now
        </Link>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 items-center justify-center md:hidden"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col gap-1.5">
            <span
              className={`block h-0.5 w-6 bg-chocolate transition-all duration-300 ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-chocolate transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-chocolate transition-all duration-300 ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 top-[60px] z-40 bg-ivory md:hidden">
          <div className="flex flex-col items-center gap-6 px-6 pt-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-lg font-medium text-chocolate"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="mt-4 rounded-lg bg-coral px-8 py-3 text-base font-medium text-white transition-colors hover:bg-coral-dark"
            >
              Register for Free
            </Link>
            <div className="mt-6 flex flex-col items-center gap-2 text-sm text-brown">
              <a href={`tel:${PHONE_NUMBERS[0].tel}`} className="text-gold">
                {PHONE_NUMBERS[0].display}
              </a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.11 1.519 5.837L0 24l6.335-1.652A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.86 0-3.63-.505-5.17-1.42l-.37-.22-3.848 1.008 1.025-3.747-.242-.384A9.79 9.79 0 012.182 12c0-5.42 4.398-9.818 9.818-9.818S21.818 6.58 21.818 12s-4.398 9.818-9.818 9.818z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
