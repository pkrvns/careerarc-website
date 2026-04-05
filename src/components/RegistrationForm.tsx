"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  fullName: string;
  mobile: string;
  otp: string;
  institution: string;
  classYear: string;
  preferredDate: string;
  parentAttending: boolean;
  parentName: string;
};

const institutions = [
  "Agrasen Inter College",
  "Annie Besant Inter College",
  "Arya Mahila Inter College",
  "BHU Central Hindu School",
  "Banaras Hindu Inter College",
  "Central Academy",
  "DAV Inter College",
  "Gandhi Inter College",
  "Harish Chandra Inter College",
  "Kashi Vidyapith Inter College",
  "Kendriya Vidyalaya BHU",
  "Marwari Inter College",
  "Ravindrapuri Inter College",
  "Shri Agrasen Inter College",
  "Sunbeam School",
  "Tulsi Vidya Niketan",
  "Udai Pratap Inter College",
  "Vasant Kanya Mahavidyalaya",
  "Other",
];

export function RegistrationForm() {
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { parentAttending: false, preferredDate: "day1" },
  });

  const parentAttending = watch("parentAttending");

  const sendOtp = async () => {
    setSending(true);
    // TODO: Call Sort String Solutions API to send OTP
    await new Promise((r) => setTimeout(r, 1500));
    setOtpSent(true);
    setSending(false);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    // TODO: Verify OTP + submit registration to Sort String API
    await new Promise((r) => setTimeout(r, 2000));
    setOtpVerified(true);
    setSubmitting(false);
  };

  if (otpVerified) {
    return (
      <div className="rounded-xl border border-gold/20 bg-white p-8 text-center">
        <div className="mb-4 text-5xl">🎉</div>
        <h2 className="mb-2 text-xl font-semibold text-chocolate">
          You&apos;re registered!
        </h2>
        <p className="mb-4 text-sm text-body">
          Your date: <strong>Day 1 (25 April)</strong>. Save this page or take a
          screenshot.
        </p>
        <div className="mb-6 rounded-lg bg-cream p-4">
          <p className="text-xs text-muted">Your QR Code will be sent via WhatsApp</p>
        </div>
        <div className="flex flex-col gap-3">
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
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-gold/20 bg-white p-6 shadow-sm md:p-8"
    >
      {/* Full Name */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-chocolate">
          Full Name <span className="text-coral">*</span>
        </label>
        <input
          {...register("fullName", {
            required: "Name is required",
            minLength: { value: 3, message: "Minimum 3 characters" },
          })}
          type="text"
          placeholder="As on Aadhaar"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-chocolate outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        />
        {errors.fullName && (
          <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      {/* Mobile Number + OTP */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-chocolate">
          Mobile Number <span className="text-coral">*</span>
        </label>
        <div className="flex gap-2">
          <input
            {...register("mobile", {
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
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-chocolate outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
          />
          <button
            type="button"
            onClick={sendOtp}
            disabled={sending || otpSent}
            className="shrink-0 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-dark disabled:opacity-50"
          >
            {sending ? "Sending..." : otpSent ? "Sent ✓" : "Send OTP"}
          </button>
        </div>
        {errors.mobile && (
          <p className="mt-1 text-xs text-red-500">{errors.mobile.message}</p>
        )}
      </div>

      {/* OTP Field */}
      {otpSent && (
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-chocolate">
            Enter OTP <span className="text-coral">*</span>
          </label>
          <input
            {...register("otp", {
              required: "OTP is required",
            })}
            type="text"
            inputMode="numeric"
            placeholder="Enter OTP"
            maxLength={6}
            autoFocus
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-chocolate outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
          />
          {errors.otp && (
            <p className="mt-1 text-xs text-red-500">{errors.otp.message}</p>
          )}
          <p className="mt-1 text-xs text-muted">
            Didn&apos;t receive? Wait 60 seconds before resending.
          </p>
        </div>
      )}

      {/* Institution */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-chocolate">
          Institution Name <span className="text-coral">*</span>
        </label>
        <select
          {...register("institution", {
            required: "Please select your institution",
          })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-chocolate outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        >
          <option value="">Select your institution</option>
          {institutions.map((inst) => (
            <option key={inst} value={inst}>
              {inst}
            </option>
          ))}
        </select>
        {errors.institution && (
          <p className="mt-1 text-xs text-red-500">
            {errors.institution.message}
          </p>
        )}
      </div>

      {/* Class / Year */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-chocolate">
          Class / Year <span className="text-coral">*</span>
        </label>
        <select
          {...register("classYear", {
            required: "Please select your class",
          })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-chocolate outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        >
          <option value="">Select your class</option>
          <option value="12th">12th</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
        </select>
        {errors.classYear && (
          <p className="mt-1 text-xs text-red-500">
            {errors.classYear.message}
          </p>
        )}
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

      {/* Parent Attending */}
      <div className="mb-5">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            {...register("parentAttending")}
            type="checkbox"
            className="h-5 w-5 rounded accent-gold"
          />
          <span className="text-sm text-chocolate">
            Will a parent/guardian attend?
          </span>
        </label>
      </div>

      {/* Parent Name (conditional) */}
      {parentAttending && (
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-chocolate">
            Parent/Guardian Name
          </label>
          <input
            {...register("parentName", {
              minLength: { value: 3, message: "Minimum 3 characters" },
            })}
            type="text"
            placeholder="For parent pass preparation"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-chocolate outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
          />
          {errors.parentName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.parentName.message}
            </p>
          )}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full rounded-lg bg-coral py-3.5 text-base font-medium text-white transition-colors hover:bg-coral-dark disabled:opacity-50"
      >
        {submitting
          ? "Submitting..."
          : "Register for Free — Confirm via OTP"}
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
