"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  fullName: string;
  mobile: string;
  institution: string;
  classYear: string;
  preferredDate: string;
  hasSmartphone: boolean;
  parentAttending: boolean;
  parentName: string;
  streamInterest: string;
};

const institutions = [
  "Adarsh Coaching Centre",
  "Arya Mahila Inter College, Chetganj",
  "Badri Narayan Vidya Mandir I.C., Kaniyar",
  "Basant Balika H.S. School",
  "Bhartiya Shiksha Mandir Inter College",
  "C.B.D.S. Inter College, Karemua",
  "C.M.G. Inter College",
  "Chandrika Singh Inter College",
  "Delta Public School",
  "G.M.V. Inter College",
  "G.V.P. Inter College, Garakhara",
  "Gautam Valley Public School",
  "Gopi Radha Balika Inter College",
  "Green Valley School",
  "Haji Ali Hasan Shahjaha Girls Inter College",
  "Hari Bandhu International School",
  "Indian Public School",
  "J.C.I.C., Sabhaipur",
  "J.P. Mehta Inter College",
  "J.S. I.T. College",
  "Jai Maa Ambey C.D. Inter College",
  "Janata Junior High School",
  "K.D.I. College, Jaunpur",
  "Kamalapati Tripathi Boys Inter College",
  "Kamla Balika Inter College",
  "Kashi Krishak Inter College",
  "Lt. Madhav Prasad Bhikha Inter College",
  "Lt. Sampat Bhagirathi Vidya Mandir I.C.",
  "M.P.B.I.C., Narayanpur Kaniyar",
  "Maa Bharti Shikshan Sansthan",
  "Maa Bhagwati Inter College",
  "Maa Radhika Inter College, Odar",
  "Maa Rampyari Balika Memorial Inter College",
  "Mahamana Malviya Inter College",
  "Mahamaya Malti Devi Inter College",
  "Mahaveer Modern Public School",
  "Mata P.V.N.I.C., Chilbila Kundi",
  "Mathura Prasad Inter College",
  "National Inter College, Pindra",
  "P.T.D.D.U. Inter College, Babatpur",
  "Pannalal Gupta Intermediate College, Jaunpur",
  "Piyari Devi I.C.",
  "Prakash Gyanoday Public Inter College",
  "Queens Inter College, Varanasi",
  "Rajeshwari Balika Inter College, Harahua",
  "Rajkiya Ashram Paddati Vidyalaya, Satomahua",
  "Rajkumari Balika Inter College",
  "Rashtriya Kanya Inter College",
  "S.A.S.M. Public School",
  "S.B. Inter College, Bunchi",
  "S.B.M.I.C., Barzi Nayepur",
  "S.B.S. Inter College",
  "S.D.M.S. Inter College",
  "S.K.B. Inter College",
  "S.K.D. Inter College, Bunchi",
  "S.K.D.I.C., Mangari",
  "S.K.V. Inter College",
  "S.N.B.P. Inter College, Khalispur",
  "S.P.B.G.N. Inter College, Hiramnapur",
  "S.P.B.S. Inter College, Khalispur",
  "S.R. Platinum English School",
  "S.S. Public School, Babatpur",
  "S.S.S. Public School, Basani",
  "S.Y.B.I. College",
  "Sanatan Dharm Inter College",
  "Sant Kishori Lal Jalan H.S. School",
  "Sant Narayan Baba Public Inter College",
  "Sardar Vallabhbhai Patel Inter College",
  "Science Academy",
  "Seth Kishori Lal Jalan, Chakka",
  "Shardha Singh Inter College, Bhaupur Jaunpur",
  "Shiv Kuwari Balika I.C., Pindra",
  "Shree Baldev Inter College",
  "Shree Devmurti Sharma Intermediate College",
  "Shree Mahadev Inter College",
  "Shree Prem Bahadur Singh Inter College, Khalispur",
  "Shree Sahadev I.C., Bhonda Jaunpur",
  "Shree Tapasvi Maharaj Inter College",
  "Shri Kamalakar Adarsh Inter College",
  "Shri Krishna Dev Inter College",
  "Shri Mahadev Inter College, Nadoy",
  "Shri Pran Baba Gorakhnath Inter College",
  "Shri Yugal Bihari Inter College, Rameshwar",
  "Smt. Kamala Bhagwat I.C., Sadhoganj",
  "Smt. Savitri Devi Inter College",
  "Sonkali Intermediate College",
  "SPAT College, Chandpur",
  "Sri Mahadev Inter College",
  "St. Xavier High School",
  "Subhadra Kumar Inter College",
  "Sunbeam Academy, Samne Ghat",
  "Swami Vivekanand Intermediate College",
  "Tripada Public School",
  "Tulsi Das Inter College, Anei",
  "U.P. Inter College",
  "Other",
];

export function RegistrationForm() {
  const [registered, setRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [allocatedDate, setAllocatedDate] = useState("");
  const [arctInfo, setArctInfo] = useState<{ name: string; institution: string; arctRoll: string } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { parentAttending: false, hasSmartphone: true, preferredDate: "", streamInterest: "" },
  });

  const parentAttending = watch("parentAttending");

  // Auto-fill from ARC-T database when mobile is entered
  const handleMobileLookup = async (mobile: string) => {
    if (!/^[6-9]\d{9}$/.test(mobile)) return;
    setLookingUp(true);
    try {
      const res = await fetch(`/api/lookup-participant?mobile=${mobile}`);
      const data = await res.json();
      if (data.found) {
        setArctInfo(data);
        setValue("fullName", data.name);
        // Try to match institution
        const match = institutions.find(
          (i) => i.toLowerCase().includes(data.institution?.toLowerCase()?.split(" ")[0] || "---")
        );
        if (match) setValue("institution", match);
      } else {
        setArctInfo(null);
      }
    } catch {
      // Silently fail — lookup is optional
    } finally {
      setLookingUp(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || "Something went wrong");
        return;
      }
      setAllocatedDate(data.preferredDate);
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
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
          <svg className="h-7 w-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-chocolate">
          Session Booked!
        </h2>
        <p className="mb-4 text-sm text-body">
          Your date: <strong>{allocatedDate}</strong>. Save this page or take a
          screenshot.
        </p>
        <div className="mb-4 rounded-lg border-2 border-red-500 bg-red-50 p-4">
          <p className="text-base font-bold text-red-700">ZAROORI: Aadhaar Card laayen!</p>
          <p className="mt-1 text-sm font-semibold text-red-600">Bina Aadhaar entry nahi milegi.</p>
        </div>
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

      {/* Mobile Number */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-chocolate">
          Mobile Number <span className="text-coral">*</span>
        </label>
        <input
          {...register("mobile", {
            required: "Mobile number is required",
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: "Enter a valid 10-digit mobile number",
            },
            onChange: (e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length === 10) handleMobileLookup(val);
            },
          })}
          type="tel"
          inputMode="numeric"
          placeholder="10-digit number"
          maxLength={10}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-chocolate outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        />
        {lookingUp && (
          <p className="mt-1 text-xs text-muted">Looking up ARC-T records...</p>
        )}
        {arctInfo && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            <span>ARC-T Participant: <strong>{arctInfo.name}</strong> ({arctInfo.arctRoll})</span>
          </div>
        )}
        {errors.mobile && (
          <p className="mt-1 text-xs text-red-500">{errors.mobile.message}</p>
        )}
      </div>

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
        <input
          {...register("preferredDate", { required: "Please select a date" })}
          type="date"
          min="2026-05-01"
          max="2026-07-31"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-chocolate focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none"
        />
        <p className="mt-1 text-xs text-muted">Daily sessions: 2:00 PM &ndash; 4:00 PM at BITE Campus</p>
        {errors.preferredDate && (
          <p className="mt-1 text-xs text-red-500">{errors.preferredDate.message}</p>
        )}
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

      {/* Stream Interest */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-chocolate">
          Career Stream Interest
        </label>
        <select
          {...register("streamInterest")}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-chocolate outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        >
          <option value="">Select a stream (optional)</option>
          <option value="Science">Science</option>
          <option value="Engineering">Engineering</option>
          <option value="IT">Information Technology</option>
          <option value="Arts">Arts &amp; Humanities</option>
          <option value="Teaching">Teaching &amp; Education</option>
          <option value="Medical">Medical &amp; Healthcare</option>
          <option value="Commerce">Commerce &amp; Finance</option>
          <option value="Government">Government Services</option>
          <option value="Vocational">Vocational &amp; Skilled Trades</option>
          <option value="Emerging">Emerging &amp; New-Age</option>
          <option value="Not Sure">Not Sure Yet</option>
        </select>
      </div>

      {/* Smartphone */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-chocolate">
          Do you have a smartphone?
        </label>
        <div className="flex gap-4">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 has-[:checked]:border-gold has-[:checked]:bg-gold/5">
            <input
              {...register("hasSmartphone")}
              type="radio"
              value="true"
              defaultChecked
              className="accent-gold"
            />
            <span className="text-sm text-chocolate">Yes</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 has-[:checked]:border-gold has-[:checked]:bg-gold/5">
            <input
              {...register("hasSmartphone")}
              type="radio"
              value="false"
              className="accent-gold"
            />
            <span className="text-sm text-chocolate">No</span>
          </label>
        </div>
        <p className="mt-1 text-xs text-muted">If no, a printed QR slip will be ready for you at the gate.</p>
      </div>

      {/* Aadhaar Reminder */}
      <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" /></svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">Aadhaar Card ZAROORI hai!</p>
            <p className="mt-1 text-xs text-amber-700">
              Apna Aadhaar Card event ke din zaroor laayen. Bina Aadhaar ke entry nahi milegi.
            </p>
          </div>
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
        {submitting ? "Booking Session..." : "Book Your Free Session"}
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
