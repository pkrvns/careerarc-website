"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

type GuestFormData = {
  guestName: string;
  guestMobile: string;
  relationship: string;
  studentMobile: string;
  preferredDate: string;
};

const relationships = [
  "Parent",
  "Guardian",
  "Teacher",
  "Friend",
];

export function GuestRegistrationForm() {
  const [registered, setRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [allocatedDate, setAllocatedDate] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestFormData>({
    defaultValues: { preferredDate: "day1" },
  });

  const onSubmit = async (data: GuestFormData) => {
    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/register-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || "Something went wrong");
        return;
      }
      setAllocatedDate(
        data.preferredDate === "day1" ? "Day 1 (25 April)" : "Day 2 (26 April)"
      );
      setRegistered(true);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (registered) {
    return (
      <div className="rounded-xl border border-gold/20 bg-white p-8 text-center">
        <div className="mb-4 text-5xl">🎉</div>
        <h2 className="mb-2 text-xl font-semibold text-chocolate">
          Guest Pass Confirmed!
        </h2>
        <p className="mb-4 text-sm text-body">
          Your date: <strong>{allocatedDate}</strong>. Please arrive with the
          student you&apos;re accompanying.
        </p>
        <div className="mb-6 rounded-lg bg-cream p-4">
          <p className="text-xs text-muted">
            Guest passes are available at the gate. Separate entry queue.
          </p>
        </div>
        <a
          href="https://wa.me/919151807551"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.11 1.519 5.837L0 24l6.335-1.652A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.86 0-3.63-.505-5.17-1.42l-.37-.22-3.848 1.008 1.025-3.747-.242-.384A9.79 9.79 0 012.182 12c0-5.42 4.398-9.818 9.818-9.818S21.818 6.58 21.818 12s-4.398 9.818-9.818 9.818z" />
          </svg>
          Join WhatsApp Community
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-gold/20 bg-white p-6 shadow-sm md:p-8"
    >
      <p className="mb-5 rounded-lg bg-cream p-3 text-xs text-brown">
        Guest capacity is limited to <strong>200 per day</strong>. Guests must
        be accompanying a registered student.
      </p>

      {/* Guest Name */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-chocolate">
          Your Name <span className="text-coral">*</span>
        </label>
        <input
          {...register("guestName", {
            required: "Name is required",
            minLength: { value: 3, message: "Minimum 3 characters" },
          })}
          type="text"
          placeholder="Full name"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-chocolate outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        />
        {errors.guestName && (
          <p className="mt-1 text-xs text-red-500">
            {errors.guestName.message}
          </p>
        )}
      </div>

      {/* Guest Mobile */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-chocolate">
          Your Mobile Number <span className="text-coral">*</span>
        </label>
        <input
          {...register("guestMobile", {
            required: "Mobile number is required",
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: "Enter a valid 10-digit mobile number",
            },
          })}
          type="tel"
          inputMode="numeric"
          placeholder="10-digit number"
          maxLength={10}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-chocolate outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        />
        {errors.guestMobile && (
          <p className="mt-1 text-xs text-red-500">
            {errors.guestMobile.message}
          </p>
        )}
      </div>

      {/* Relationship */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-chocolate">
          Relationship to Student <span className="text-coral">*</span>
        </label>
        <select
          {...register("relationship", {
            required: "Please select relationship",
          })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-chocolate outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        >
          <option value="">Select relationship</option>
          {relationships.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {errors.relationship && (
          <p className="mt-1 text-xs text-red-500">
            {errors.relationship.message}
          </p>
        )}
      </div>

      {/* Student Mobile (for verification) */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-chocolate">
          Student&apos;s Mobile Number <span className="text-coral">*</span>
        </label>
        <input
          {...register("studentMobile", {
            required: "Student's mobile number is required",
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: "Enter a valid 10-digit mobile number",
            },
          })}
          type="tel"
          inputMode="numeric"
          placeholder="Mobile number of the student you're accompanying"
          maxLength={10}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-chocolate outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        />
        {errors.studentMobile && (
          <p className="mt-1 text-xs text-red-500">
            {errors.studentMobile.message}
          </p>
        )}
        <p className="mt-1 text-xs text-muted">
          Must match a registered student&apos;s number
        </p>
      </div>

      {/* Preferred Date */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-chocolate">
          Preferred Date <span className="text-coral">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 has-[:checked]:border-gold has-[:checked]:bg-gold/5">
            <input
              {...register("preferredDate", { required: true })}
              type="radio"
              value="day1"
              className="accent-gold"
            />
            <span className="text-sm text-chocolate">Day 1 (25 Apr)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 has-[:checked]:border-gold has-[:checked]:bg-gold/5">
            <input
              {...register("preferredDate", { required: true })}
              type="radio"
              value="day2"
              className="accent-gold"
            />
            <span className="text-sm text-chocolate">Day 2 (26 Apr)</span>
          </label>
        </div>
      </div>

      {/* Server Error */}
      {serverError && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full rounded-lg bg-coral py-3.5 text-base font-medium text-white transition-colors hover:bg-coral-dark disabled:opacity-50"
      >
        {submitting ? "Registering..." : "Register as Guest"}
      </button>

      <p className="mt-4 text-center text-xs text-muted">
        By registering, you agree to our{" "}
        <a href="/privacy" className="text-gold underline">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="/terms" className="text-gold underline">
          Terms
        </a>
        .
      </p>
    </form>
  );
}
