"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";

/* ---------- Types ---------- */
interface VolunteerUser {
  name: string;
  phone: string;
  role: string;
  department?: string;
}

interface ActivityItem {
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: number;
  metadata: string;
  created_at: string;
}

interface Stats {
  scansToday: number;
  feedbackToday: number;
  registrationsToday: number;
  recentActivity: ActivityItem[];
}

type ActiveView = "dashboard" | "register" | "feedback" | "riasec" | "qrscanner";

/* ---------- Career stream options ---------- */
const CAREER_STREAMS = [
  "Engineering",
  "Medical / Healthcare",
  "Commerce / CA / MBA",
  "Law",
  "Arts / Humanities",
  "Science / Research",
  "Design / Architecture",
  "IT / Computer Science",
  "Government / Civil Services",
  "Media / Journalism",
  "Other",
];

/* ========== Main Component ========== */
export default function VolunteerPage() {
  const [user, setUser] = useState<VolunteerUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if volunteer is already logged in via cookie
  useEffect(() => {
    try {
      const cookies = document.cookie.split("; ");
      const tokenCookie = cookies.find((c) => c.startsWith("volunteer_token="));
      if (tokenCookie) {
        const value = decodeURIComponent(tokenCookie.split("=").slice(1).join("="));
        const parsed = JSON.parse(value);
        if (parsed.name && parsed.phone) {
          setUser(parsed);
        }
      }
    } catch {
      // Invalid cookie, stay on login
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    document.cookie = "volunteer_token=; path=/; max-age=0";
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="animate-pulse text-chocolate text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {/* Top Bar */}
      <header className="bg-chocolate text-cream px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-chocolate font-bold text-sm">
            CA
          </div>
          <div>
            <span className="font-semibold text-gold text-sm">CareerArc</span>
            <span className="text-cream/70 text-xs ml-2">Volunteer App</span>
          </div>
        </div>
        {user && (
          <button
            onClick={handleLogout}
            className="text-xs text-cream/70 hover:text-cream border border-cream/30 rounded-lg px-3 py-1.5 transition-colors"
          >
            Logout
          </button>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {user ? <Dashboard user={user} /> : <LoginScreen onLogin={setUser} />}
      </main>
    </div>
  );
}

/* ========== Login Screen ========== */
function LoginScreen({ onLogin }: { onLogin: (u: VolunteerUser) => void }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/volunteer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      onLogin({ name: data.name, phone, role: data.role, department: data.department });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full bg-white rounded-xl border border-gold/20 shadow-sm p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-chocolate">Volunteer Login</h1>
          <p className="text-body text-sm mt-1">Enter your registered phone number</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-chocolate mb-1">Phone Number</label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="9876543210"
              className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-ivory text-chocolate placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 text-lg tracking-wider"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-coral text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || phone.length !== 10}
            className="w-full py-3 rounded-xl bg-coral text-white font-semibold text-sm hover:bg-coral-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Checking..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ========== Dashboard ========== */
function Dashboard({ user }: { user: VolunteerUser }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [toast, setToast] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/volunteer/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Silent fail on stats
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchStats]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleActionComplete = (message: string) => {
    showToast(message);
    setActiveView("dashboard");
    fetchStats();
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-chocolate text-cream px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-fade-in max-w-[90vw]">
          {toast}
        </div>
      )}

      {/* Welcome */}
      <div className="bg-white rounded-xl border border-gold/20 p-4">
        <h2 className="text-lg font-semibold text-chocolate">
          Welcome, {user.name}
        </h2>
        <p className="text-body text-sm">
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          {user.department ? ` -- ${user.department}` : ""}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Scanned" value={stats?.scansToday ?? "--"} icon="scan" />
        <StatCard label="Feedback" value={stats?.feedbackToday ?? "--"} icon="feedback" />
        <StatCard label="Registered" value={stats?.registrationsToday ?? "--"} icon="register" />
      </div>

      {/* Quick Actions */}
      {activeView === "dashboard" && (
        <div className="grid grid-cols-2 gap-3">
          <ActionButton
            label="Scan QR"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75H16.5v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75H16.5v-.75z" />
              </svg>
            }
            onClick={() => setActiveView("qrscanner")}
            color="gold"
          />
          <ActionButton
            label="Register Walk-in"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            }
            onClick={() => setActiveView("register")}
            color="coral"
          />
          <ActionButton
            label="Capture Feedback"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            }
            onClick={() => setActiveView("feedback")}
            color="gold"
          />
          <ActionButton
            label="RIASEC Test"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            }
            onClick={() => setActiveView("riasec")}
            color="coral"
          />
          <ActionButton
            label="Activity Feed"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            onClick={() => {
              const el = document.getElementById("activity-feed");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            color="coral"
          />
        </div>
      )}

      {/* Inline Forms */}
      {activeView === "register" && (
        <WalkinForm
          onBack={() => setActiveView("dashboard")}
          onSuccess={handleActionComplete}
        />
      )}

      {activeView === "feedback" && (
        <FeedbackForm
          onBack={() => setActiveView("dashboard")}
          onSuccess={handleActionComplete}
        />
      )}

      {activeView === "riasec" && (
        <RiasecTest
          onBack={() => setActiveView("dashboard")}
          onSuccess={handleActionComplete}
        />
      )}

      {activeView === "qrscanner" && (
        <QRScannerView
          volunteerName={user.name}
          onBack={() => setActiveView("dashboard")}
          onSuccess={handleActionComplete}
        />
      )}

      {/* Activity Feed */}
      <div id="activity-feed">
        <h3 className="text-sm font-semibold text-chocolate mb-2">Recent Activity</h3>
        <div className="bg-white rounded-xl border border-gold/20 divide-y divide-gold/10">
          {!stats?.recentActivity?.length ? (
            <p className="p-4 text-sm text-muted text-center">No recent activity</p>
          ) : (
            stats.recentActivity.slice(0, 10).map((item, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-gold mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-chocolate">
                    <span className="font-medium">{item.user_name}</span>{" "}
                    {formatAction(item.action)}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {formatTime(item.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ========== Stat Card ========== */
function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  const iconColors: Record<string, string> = {
    scan: "text-zone-blue",
    feedback: "text-zone-purple",
    register: "text-zone-green",
  };

  return (
    <div className="bg-white rounded-xl border border-gold/20 p-3 text-center">
      <div className={`text-2xl font-bold ${iconColors[icon] || "text-chocolate"}`}>
        {value}
      </div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  );
}

/* ========== Action Button ========== */
function ActionButton({
  label,
  icon,
  onClick,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: "gold" | "coral";
}) {
  const bg = color === "coral" ? "bg-coral/10 text-coral" : "bg-gold/10 text-gold-dark";
  const border = color === "coral" ? "border-coral/20" : "border-gold/20";

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border ${border} ${bg} hover:opacity-80 active:scale-95 transition-all`}
    >
      {icon}
      <span className="text-xs font-medium text-chocolate">{label}</span>
    </button>
  );
}

/* ========== Walk-in Registration Form ========== */
interface WalkinFormData {
  name: string;
  phone: string;
  institution: string;
  classYear: string;
}

function WalkinForm({ onBack, onSuccess }: { onBack: () => void; onSuccess: (msg: string) => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<WalkinFormData>();
  const [apiError, setApiError] = useState("");

  const onSubmit = async (data: WalkinFormData) => {
    setApiError("");
    try {
      const res = await fetch("/api/volunteer/register-walkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        setApiError(result.error || "Registration failed");
        return;
      }

      onSuccess(result.message || "Walk-in registered successfully");
    } catch {
      setApiError("Network error. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gold/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-chocolate">Register Walk-in</h3>
        <button onClick={onBack} className="text-xs text-muted hover:text-chocolate">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Field label="Student Name" error={errors.name?.message}>
          <input
            {...register("name", { required: "Name is required" })}
            className="form-input"
            placeholder="Full name"
          />
        </Field>

        <Field label="Phone" error={errors.phone?.message}>
          <input
            {...register("phone", {
              required: "Phone is required",
              pattern: { value: /^[6-9]\d{9}$/, message: "Invalid 10-digit number" },
            })}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            className="form-input"
            placeholder="9876543210"
          />
        </Field>

        <Field label="Institution" error={errors.institution?.message}>
          <input
            {...register("institution", { required: "Institution is required" })}
            className="form-input"
            placeholder="School / College name"
          />
        </Field>

        <Field label="Class / Year" error={errors.classYear?.message}>
          <input
            {...register("classYear", { required: "Class/Year is required" })}
            className="form-input"
            placeholder="e.g. 10th, 12th, B.A. 2nd year"
          />
        </Field>

        {apiError && <p className="text-coral text-sm">{apiError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-coral text-white font-semibold text-sm hover:bg-coral-dark transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Registering..." : "Register Walk-in"}
        </button>
      </form>
    </div>
  );
}

/* ========== Feedback Form ========== */
interface FeedbackFormData {
  studentPhone: string;
  rating: number;
  nps: number;
  mostUseful: string;
  careerConsidering: string;
  suggestion: string;
}

function FeedbackForm({ onBack, onSuccess }: { onBack: () => void; onSuccess: (msg: string) => void }) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FeedbackFormData>({
    defaultValues: { rating: 7, nps: 7 },
  });
  const [apiError, setApiError] = useState("");

  const rating = watch("rating");
  const nps = watch("nps");

  const onSubmit = async (data: FeedbackFormData) => {
    setApiError("");
    try {
      const res = await fetch("/api/volunteer/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          rating: Number(data.rating),
          nps: Number(data.nps),
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        setApiError(result.error || "Failed to submit feedback");
        return;
      }

      onSuccess(result.message || "Feedback collected successfully");
    } catch {
      setApiError("Network error. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gold/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-chocolate">Capture Feedback</h3>
        <button onClick={onBack} className="text-xs text-muted hover:text-chocolate">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Student Phone" error={errors.studentPhone?.message}>
          <input
            {...register("studentPhone", {
              required: "Student phone is required",
              pattern: { value: /^[6-9]\d{9}$/, message: "Invalid 10-digit number" },
            })}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            className="form-input"
            placeholder="Student's registered phone"
          />
        </Field>

        {/* Rating Slider */}
        <div>
          <label className="block text-sm font-medium text-chocolate mb-1">
            Rating: <span className="text-gold font-bold">{rating}/10</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            {...register("rating")}
            onChange={(e) => setValue("rating", Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-gold"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>

        <Field label="Most useful thing learned">
          <textarea
            {...register("mostUseful")}
            className="form-input min-h-[60px] resize-none"
            placeholder="What did the student find most useful?"
            rows={2}
          />
        </Field>

        {/* NPS Slider */}
        <div>
          <label className="block text-sm font-medium text-chocolate mb-1">
            Would recommend to friends (NPS): <span className="text-gold font-bold">{nps}/10</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            {...register("nps")}
            onChange={(e) => setValue("nps", Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-coral"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>Unlikely</span>
            <span>Definitely</span>
          </div>
        </div>

        <Field label="Career stream considering">
          <select
            {...register("careerConsidering")}
            className="form-input"
            defaultValue=""
          >
            <option value="" disabled>Select a stream</option>
            {CAREER_STREAMS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Field label="Suggestion / Comments">
          <textarea
            {...register("suggestion")}
            className="form-input min-h-[60px] resize-none"
            placeholder="Any suggestions or comments?"
            rows={2}
          />
        </Field>

        {apiError && <p className="text-coral text-sm">{apiError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-coral text-white font-semibold text-sm hover:bg-coral-dark transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}

/* ========== Shared Field Wrapper ========== */
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-chocolate mb-1">{label}</label>
      {children}
      {error && <p className="text-coral text-xs mt-1">{error}</p>}
    </div>
  );
}

/* ========== RIASEC Test ========== */
const RIASEC_QUESTIONS = [
  { q: "Kya aapko machines ya tools se kaam karna achha lagta hai?", type: "R" as const },
  { q: "Kya aap outdoor activities ya physical work enjoy karte hain?", type: "R" as const },
  { q: "Kya aapko science experiments ya research mein interest hai?", type: "I" as const },
  { q: "Kya aap problems ko analyse karke solve karna pasand karte hain?", type: "I" as const },
  { q: "Kya aapko drawing, music, ya creative writing mein maja aata hai?", type: "A" as const },
  { q: "Kya aap naye ideas sochna ya design karna enjoy karte hain?", type: "A" as const },
  { q: "Kya aapko logon ki madad karna ya sikhana achha lagta hai?", type: "S" as const },
  { q: "Kya aap teamwork aur group activities mein comfortable hain?", type: "S" as const },
  { q: "Kya aapko lead karna ya logon ko motivate karna pasand hai?", type: "E" as const },
  { q: "Kya aap apna business ya project start karna chahte hain?", type: "E" as const },
  { q: "Kya aapko data organize karna ya records maintain karna achha lagta hai?", type: "C" as const },
  { q: "Kya aap rules follow karna aur systematic kaam karna prefer karte hain?", type: "C" as const },
];

const RIASEC_LABELS: Record<string, { name: string; hindi: string; color: string }> = {
  R: { name: "Realistic", hindi: "Vyavaharik (practical kaam)", color: "#e74c3c" },
  I: { name: "Investigative", hindi: "Khoji (research / sochne waala)", color: "#3498db" },
  A: { name: "Artistic", hindi: "Kalaaatmak (creative)", color: "#9b59b6" },
  S: { name: "Social", hindi: "Samajik (logon ke saath)", color: "#2ecc71" },
  E: { name: "Enterprising", hindi: "Udyami (leader / business)", color: "#f39c12" },
  C: { name: "Conventional", hindi: "Paramparagat (organized / systematic)", color: "#1abc9c" },
};

const SCALE_LABELS = ["Bilkul Nahi", "Thoda", "Theek hai", "Haan", "Bilkul Haan"];

function RiasecTest({ onBack, onSuccess }: { onBack: () => void; onSuccess: (msg: string) => void }) {
  const [studentPhone, setStudentPhone] = useState("");
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ scores: Record<string, number>; topTypes: string[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleAnswer = (qIndex: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };

  const allAnswered = Object.keys(answers).length === 12;

  const calculateResults = () => {
    const raw: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    RIASEC_QUESTIONS.forEach((q, i) => {
      raw[q.type] += answers[i] || 0;
    });
    // Max per type is 10 (2 questions * 5 max each)
    const scores: Record<string, number> = {};
    for (const key of Object.keys(raw)) {
      scores[key] = Math.round((raw[key] / 10) * 100);
    }
    // Top 2 types
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topTypes = [sorted[0][0], sorted[1][0]];
    setResult({ scores, topTypes });
  };

  const saveResult = async () => {
    if (!result) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/volunteer/riasec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_mobile: studentPhone,
          scores: result.scores,
          top_types: result.topTypes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }
      setSaved(true);
      onSuccess(data.message || "RIASEC result saved");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // Step 1: Enter phone
  if (!phoneConfirmed) {
    return (
      <div className="bg-white rounded-xl border border-gold/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-chocolate">RIASEC Test</h3>
          <button onClick={onBack} className="text-xs text-muted hover:text-chocolate">Cancel</button>
        </div>
        <p className="text-sm text-body mb-3">Student ka phone number daalen:</p>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={studentPhone}
          onChange={(e) => setStudentPhone(e.target.value.replace(/\D/g, ""))}
          placeholder="9876543210"
          className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-ivory text-chocolate placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 text-lg tracking-wider mb-3"
        />
        <button
          onClick={() => { if (/^[6-9]\d{9}$/.test(studentPhone)) setPhoneConfirmed(true); else setError("Valid 10-digit number daalen"); }}
          disabled={studentPhone.length !== 10}
          className="w-full py-3 rounded-xl bg-coral text-white font-semibold text-sm hover:bg-coral-dark transition-colors disabled:opacity-50"
        >
          Start Test
        </button>
        {error && <p className="text-coral text-sm mt-2">{error}</p>}
      </div>
    );
  }

  // Step 3: Show results
  if (result) {
    return (
      <div className="bg-white rounded-xl border border-gold/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-chocolate">RIASEC Result</h3>
          <button onClick={onBack} className="text-xs text-muted hover:text-chocolate">Back</button>
        </div>

        {/* Bar Chart */}
        <div className="space-y-3 mb-4">
          {Object.entries(result.scores)
            .sort((a, b) => b[1] - a[1])
            .map(([type, pct]) => {
              const info = RIASEC_LABELS[type];
              const isTop = result.topTypes.includes(type);
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${isTop ? "text-chocolate" : "text-muted"}`}>
                      {type} - {info.name} {isTop && "★"}
                    </span>
                    <span className="text-xs text-muted">{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-4 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: info.color }}
                    />
                  </div>
                </div>
              );
            })}
        </div>

        {/* Top 2 highlight */}
        <div className="bg-ivory rounded-xl p-3 mb-4">
          <p className="text-sm font-semibold text-chocolate mb-2">Aapke Top Types:</p>
          {result.topTypes.map((t) => {
            const info = RIASEC_LABELS[t];
            return (
              <div key={t} className="flex items-center gap-2 mb-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }} />
                <span className="text-sm text-chocolate font-medium">{t} - {info.name}</span>
                <span className="text-xs text-muted">({info.hindi})</span>
              </div>
            );
          })}
        </div>

        {error && <p className="text-coral text-sm mb-2">{error}</p>}

        {!saved ? (
          <button
            onClick={saveResult}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-coral text-white font-semibold text-sm hover:bg-coral-dark transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Result"}
          </button>
        ) : (
          <p className="text-center text-sm text-zone-green font-medium">Result saved!</p>
        )}
      </div>
    );
  }

  // Step 2: Questions
  return (
    <div className="bg-white rounded-xl border border-gold/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-chocolate">RIASEC Test</h3>
        <button onClick={onBack} className="text-xs text-muted hover:text-chocolate">Cancel</button>
      </div>
      <p className="text-xs text-muted mb-4">
        Phone: {studentPhone} &bull; {Object.keys(answers).length}/12 answered
      </p>

      <div className="space-y-5">
        {RIASEC_QUESTIONS.map((q, i) => (
          <div key={i} className="border-b border-gold/10 pb-4 last:border-0">
            <p className="text-sm text-chocolate mb-2">
              <span className="font-medium text-gold mr-1">Q{i + 1}.</span>
              {q.q}
            </p>
            <div className="flex gap-1">
              {SCALE_LABELS.map((label, val) => {
                const score = val + 1;
                const selected = answers[i] === score;
                return (
                  <button
                    key={val}
                    onClick={() => handleAnswer(i, score)}
                    className={`flex-1 py-1.5 px-0.5 rounded-lg text-[10px] leading-tight font-medium transition-all border ${
                      selected
                        ? "bg-coral text-white border-coral"
                        : "bg-ivory text-chocolate border-gold/20 hover:border-coral/40"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={calculateResults}
        disabled={!allAnswered}
        className="w-full py-3 mt-4 rounded-xl bg-coral text-white font-semibold text-sm hover:bg-coral-dark transition-colors disabled:opacity-50"
      >
        {allAnswered ? "See Result" : `${12 - Object.keys(answers).length} questions remaining`}
      </button>
    </div>
  );
}

/* ========== QR Scanner View ========== */
interface ScannedStudent {
  id: number;
  name: string;
  institution: string;
  mobile: string;
  classYear: string;
}

function QRScannerView({
  volunteerName,
  onBack,
  onSuccess,
}: {
  volunteerName: string;
  onBack: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [scanning, setScanning] = useState(true);
  const [scannedStudent, setScannedStudent] = useState<ScannedStudent | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [aadhaarConfirmed, setAadhaarConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<unknown>(null);

  // Start scanner
  useEffect(() => {
    if (!scanning) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scanner: any = null;

    const initScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!scannerRef.current) return;

        scanner = new Html5Qrcode("qr-reader");
        html5QrCodeRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText: string) => {
            // Stop scanner after successful scan
            try {
              await scanner.stop();
            } catch { /* ignore */ }

            setScanning(false);

            // Look up student - QR might contain mobile number or student ID
            try {
              const isNumericId = /^\d+$/.test(decodedText) && decodedText.length < 10;
              const isMobile = /^[6-9]\d{9}$/.test(decodedText);
              const param = isNumericId ? `id=${decodedText}` : isMobile ? `mobile=${decodedText}` : `mobile=${decodedText}`;

              const res = await fetch(`/api/volunteer/lookup?${param}`);
              if (res.ok) {
                const data = await res.json();
                setScannedStudent(data);
              } else {
                setError(`Student not found for: ${decodedText}`);
              }
            } catch {
              setError("Failed to look up student");
            }
          },
          () => {
            // QR scan error - ignore (continuous scanning)
          }
        );
      } catch (err) {
        console.error("Scanner init error:", err);
        setError("Camera access denied or not available. Please allow camera permission.");
        setScanning(false);
      }
    };

    initScanner();

    return () => {
      if (scanner) {
        scanner.stop().catch(() => {});
        scanner.clear();
      }
    };
  }, [scanning]);

  const handleScan = async () => {
    if (!scannedStudent || !selectedPoint) return;
    if (selectedPoint === "Gate" && !aadhaarConfirmed) {
      setError("Gate scan: Aadhaar check confirm karein");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/volunteer/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: scannedStudent.id,
          scan_point: selectedPoint,
          scanned_by: volunteerName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Scan failed");
        return;
      }
      onSuccess(data.message || `Scan recorded at ${selectedPoint}`);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetScanner = () => {
    setScannedStudent(null);
    setSelectedPoint(null);
    setAadhaarConfirmed(false);
    setError("");
    setScanning(true);
  };

  const scanPoints = ["Gate", "RIASEC", "Counselling", "Institution"];
  const scanPointColors: Record<string, string> = {
    Gate: "bg-zone-blue/10 border-zone-blue/30 text-zone-blue",
    RIASEC: "bg-zone-purple/10 border-zone-purple/30 text-zone-purple",
    Counselling: "bg-zone-green/10 border-zone-green/30 text-zone-green",
    Institution: "bg-gold/10 border-gold/30 text-gold-dark",
  };

  return (
    <div className="bg-white rounded-xl border border-gold/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-chocolate">QR Scanner</h3>
        <button onClick={onBack} className="text-xs text-muted hover:text-chocolate">Back</button>
      </div>

      {/* Camera view */}
      {scanning && (
        <div className="mb-4">
          <div ref={scannerRef} id="qr-reader" className="rounded-xl overflow-hidden" />
          <p className="text-xs text-muted text-center mt-2">Camera ko QR code ki taraf point karein</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-coral/10 border border-coral/20 rounded-xl p-3 mb-4">
          <p className="text-sm text-coral">{error}</p>
          {!scanning && (
            <button onClick={resetScanner} className="text-xs text-coral underline mt-1">Scan again</button>
          )}
        </div>
      )}

      {/* Student info after scan */}
      {scannedStudent && (
        <>
          <div className="bg-ivory rounded-xl p-3 mb-4">
            <p className="text-sm font-semibold text-chocolate">{scannedStudent.name}</p>
            <p className="text-xs text-muted">{scannedStudent.institution}</p>
            <p className="text-xs text-muted">{scannedStudent.classYear} &bull; {scannedStudent.mobile}</p>
          </div>

          {/* Scan point selection */}
          <p className="text-sm font-medium text-chocolate mb-2">Scan Point select karein:</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {scanPoints.map((point) => (
              <button
                key={point}
                onClick={() => { setSelectedPoint(point); setError(""); }}
                className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedPoint === point
                    ? "ring-2 ring-coral " + scanPointColors[point]
                    : scanPointColors[point] + " opacity-70 hover:opacity-100"
                }`}
              >
                {point}
              </button>
            ))}
          </div>

          {/* Aadhaar check for Gate */}
          {selectedPoint === "Gate" && (
            <div className="bg-ivory rounded-xl p-3 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setAadhaarConfirmed(!aadhaarConfirmed)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${aadhaarConfirmed ? "bg-zone-green" : "bg-gray-300"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${aadhaarConfirmed ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm text-chocolate font-medium">Aadhaar check kiya?</span>
              </label>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-2">
            <button
              onClick={resetScanner}
              className="flex-1 py-3 rounded-xl border border-gold/20 text-chocolate text-sm font-medium hover:bg-ivory transition-colors"
            >
              Scan Again
            </button>
            <button
              onClick={handleScan}
              disabled={!selectedPoint || submitting || (selectedPoint === "Gate" && !aadhaarConfirmed)}
              className="flex-1 py-3 rounded-xl bg-coral text-white font-semibold text-sm hover:bg-coral-dark transition-colors disabled:opacity-50"
            >
              {submitting ? "Recording..." : "Record Scan"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ========== Helpers ========== */
function formatAction(action: string): string {
  const map: Record<string, string> = {
    registered_walkin: "registered a walk-in student",
    collected_feedback: "collected feedback",
    scanned_qr: "scanned a QR code",
  };
  return map[action] || action.replace(/_/g, " ");
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}
