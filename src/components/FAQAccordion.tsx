"use client";

import { useState } from "react";

type FAQ = { q: string; a: string };

export function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="rounded-xl border border-gold/20 bg-white overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <span className="pr-4 text-sm font-medium text-chocolate md:text-base">
              {faq.q}
            </span>
            <svg
              className={`h-5 w-5 shrink-0 text-gold transition-transform duration-200 ${
                openIndex === i ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {openIndex === i && (
            <div className="border-t border-gold/10 px-5 py-4 text-sm leading-relaxed text-body">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
