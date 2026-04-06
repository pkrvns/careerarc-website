"use client";

import { useState } from "react";
import { RegistrationForm } from "./RegistrationForm";
import { GuestRegistrationForm } from "./GuestRegistrationForm";

export function RegistrationTabs() {
  const [tab, setTab] = useState<"student" | "guest">("student");

  return (
    <div>
      {/* Tab Switcher */}
      <div className="mb-6 flex rounded-xl border border-gold/20 bg-white p-1">
        <button
          onClick={() => setTab("student")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            tab === "student"
              ? "bg-coral text-white"
              : "text-brown hover:text-chocolate"
          }`}
        >
          Student
        </button>
        <button
          onClick={() => setTab("guest")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            tab === "guest"
              ? "bg-coral text-white"
              : "text-brown hover:text-chocolate"
          }`}
        >
          Guest / Parent
        </button>
      </div>

      {/* Tab Content */}
      {tab === "student" ? <RegistrationForm /> : <GuestRegistrationForm />}
    </div>
  );
}
