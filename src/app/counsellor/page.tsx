"use client";

import { useState, useEffect, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface SessionRow {
  session_id: number;
  status: string;
  shift: string;
  notes: string | null;
  recommended_streams: string | null;
  cabin_id: string;
  session_date: string;
  student_id: number;
  student_name: string;
  student_mobile: string;
  institution: string;
  class_year: string;
  stream_interest: string | null;
  arct_roll: string | null;
  arct_status: string | null;
}

interface CounsellorAuth {
  name: string;
  cabinId: string;
  specialization: string;
}

const STREAM_OPTIONS = [
  "Engineering",
  "Medical / Health Sciences",
  "Commerce / CA / CS",
  "Arts / Humanities",
  "Law",
  "Design / Architecture",
  "Hotel Management",
  "Agriculture",
  "IT / Computer Science",
  "Teaching / Education",
  "Defence / NDA",
  "Civil Services / UPSC",
  "Vocational / Skill-based",
  "Other",
];

const INSTITUTION_PROGRAMMES: Record<string, string[]> = {
  BITE: [
    "B.Tech Computer Science",
    "B.Tech Mechanical Engineering",
    "B.Tech Civil Engineering",
    "B.Tech Electrical Engineering",
    "B.Tech Electronics & Communication",
    "BBA",
    "BCA",
    "MBA",
    "MCA",
  ],
  BIPE: [
    "B.Pharm",
    "D.Pharm",
    "M.Pharm",
    "B.Sc Nursing",
    "GNM",
    "ANM",
    "BMLT",
    "DMLT",
  ],
  BIP: [
    "BA Sociology",
    "BA English",
    "BA Hindi",
    "BA Political Science",
    "B.Ed",
    "MA Sociology",
    "MA English",
  ],
};

/* ------------------------------------------------------------------ */
/*  Login Screen                                                       */
/* ------------------------------------------------------------------ */
function LoginScreen({
  onLogin,
}: {
  onLogin: (auth: CounsellorAuth) => void;
}) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/counsellor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      onLogin({
        name: data.name,
        cabinId: data.cabinId || "",
        specialization: data.specialization || "",
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 mb-4">
            <svg
              className="w-8 h-8 text-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-chocolate">
            Counsellor Portal
          </h1>
          <p className="text-body mt-1">CareerArc ARC-T 2.0</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-cream p-8">
          <label className="block text-sm font-medium text-chocolate mb-2">
            Mobile Number
          </label>
          <input
            type="tel"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Enter your 10-digit number"
            className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory text-chocolate placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all"
          />
          {error && (
            <p className="text-coral text-sm mt-2">{error}</p>
          )}
          <button
            onClick={handleLogin}
            disabled={phone.length !== 10 || loading}
            className="w-full mt-4 py-3 px-6 rounded-xl bg-gold text-white font-medium hover:bg-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Verifying..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Student Profile Modal                                              */
/* ------------------------------------------------------------------ */
function StudentProfileModal({
  session,
  onClose,
}: {
  session: SessionRow;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-chocolate/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cream">
          <h3 className="text-lg font-semibold text-chocolate">
            Student Profile
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-cream transition-colors"
          >
            <svg className="w-5 h-5 text-body" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Name" value={session.student_name} />
            <InfoField label="Phone" value={session.student_mobile} />
            <InfoField label="Institution" value={session.institution} />
            <InfoField label="Class / Year" value={session.class_year} />
          </div>

          {/* ARC-T Data */}
          <div className="bg-ivory rounded-xl p-4 border border-cream">
            <h4 className="text-sm font-medium text-gold-dark mb-2">
              ARC-T Data
            </h4>
            {session.arct_roll ? (
              <div className="grid grid-cols-2 gap-3">
                <InfoField label="ARC-T Roll" value={session.arct_roll} />
                <InfoField
                  label="Status"
                  value={session.arct_status || "N/A"}
                />
              </div>
            ) : (
              <p className="text-sm text-muted">
                No ARC-T data available for this student.
              </p>
            )}
          </div>

          {/* RIASEC placeholder */}
          <div className="bg-cream/50 rounded-xl p-4 border border-cream">
            <h4 className="text-sm font-medium text-gold-dark mb-2">
              RIASEC Type
            </h4>
            <p className="text-sm text-muted italic">
              RIASEC profiling will be available after assessment integration.
            </p>
          </div>

          {/* Stream Interest */}
          {session.stream_interest && (
            <div className="bg-ivory rounded-xl p-4 border border-cream">
              <h4 className="text-sm font-medium text-gold-dark mb-2">
                Stream Interest (Self-Reported)
              </h4>
              <span className="inline-block px-3 py-1 bg-gold/10 text-gold-dark rounded-full text-sm font-medium">
                {session.stream_interest}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-chocolate mt-0.5">
        {value || "N/A"}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Session Notes Form                                                 */
/* ------------------------------------------------------------------ */
function SessionNotesForm({
  session,
  onSaved,
}: {
  session: SessionRow;
  onSaved: () => void;
}) {
  const existingNotes = session.notes?.split("\n---meta:")[0] || "";
  const existingStreams = session.recommended_streams
    ? session.recommended_streams.split(",").map((s) => s.trim())
    : [];

  const [notes, setNotes] = useState(existingNotes);
  const [selectedStreams, setSelectedStreams] =
    useState<string[]>(existingStreams);
  const [followUp, setFollowUp] = useState(false);
  const [refSlipNeeded, setRefSlipNeeded] = useState(false);
  const [status, setStatus] = useState(session.status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Reference slip state
  const [showRefForm, setShowRefForm] = useState(false);
  const [refInstitution, setRefInstitution] = useState("");
  const [refProgramme, setRefProgramme] = useState("");
  const [generatedRef, setGeneratedRef] = useState("");
  const [refLoading, setRefLoading] = useState(false);

  const toggleStream = (stream: string) => {
    setSelectedStreams((prev) =>
      prev.includes(stream)
        ? prev.filter((s) => s !== stream)
        : [...prev, stream]
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/counsellor/session-notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.session_id,
          notes,
          recommendedStreams: selectedStreams.join(", "),
          status,
          followUpNeeded: followUp,
        }),
      });
      if (res.ok) {
        setSaved(true);
        onSaved();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // silent fail with indicator
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateRef = async () => {
    setRefLoading(true);
    try {
      const res = await fetch("/api/counsellor/reference-slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.session_id,
          studentId: session.student_id,
          institution: refInstitution,
          programme: refProgramme,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedRef(data.refCode);
      }
    } catch {
      // silent
    } finally {
      setRefLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-chocolate/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cream">
          <div>
            <h3 className="text-lg font-semibold text-chocolate">
              Session Notes
            </h3>
            <p className="text-sm text-muted">
              {session.student_name} &middot; {session.institution}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Saved
              </span>
            )}
            <button
              onClick={onSaved}
              className="p-2 rounded-lg hover:bg-cream transition-colors"
            >
              <svg className="w-5 h-5 text-body" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Session Status */}
          <div>
            <label className="block text-sm font-medium text-chocolate mb-2">
              Session Status
            </label>
            <div className="flex gap-2 flex-wrap">
              {["Waiting", "In Cabin", "Completed", "No Show"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s.toLowerCase().replace(" ", "_"));
                    setSaved(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    status === s.toLowerCase().replace(" ", "_")
                      ? "bg-gold text-white"
                      : "bg-cream text-body hover:bg-gold/10"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Streams Discussed */}
          <div>
            <label className="block text-sm font-medium text-chocolate mb-2">
              Streams Discussed
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {STREAM_OPTIONS.map((stream) => (
                <label
                  key={stream}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-all ${
                    selectedStreams.includes(stream)
                      ? "bg-gold/10 text-gold-dark border border-gold/30"
                      : "bg-ivory text-body border border-cream hover:border-gold/20"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedStreams.includes(stream)}
                    onChange={() => toggleStream(stream)}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedStreams.includes(stream)
                        ? "bg-gold border-gold text-white"
                        : "border-muted"
                    }`}
                  >
                    {selectedStreams.includes(stream) && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  {stream}
                </label>
              ))}
            </div>
          </div>

          {/* Key Observations */}
          <div>
            <label className="block text-sm font-medium text-chocolate mb-2">
              Key Observations
            </label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setSaved(false);
              }}
              placeholder="Student's strengths, interests, concerns, aptitude observations..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory text-chocolate placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all resize-none"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <ToggleSwitch
              label="Follow-up needed"
              checked={followUp}
              onChange={(v) => {
                setFollowUp(v);
                setSaved(false);
              }}
            />
            <ToggleSwitch
              label="Reference slip needed"
              checked={refSlipNeeded}
              onChange={(v) => {
                setRefSlipNeeded(v);
                if (v) setShowRefForm(true);
              }}
            />
          </div>

          {/* Reference Slip Form */}
          {showRefForm && refSlipNeeded && (
            <div className="bg-ivory rounded-xl p-5 border border-gold/20">
              {generatedRef ? (
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-chocolate">
                    Reference Slip Generated
                  </h4>
                  <p className="text-2xl font-bold text-gold">{generatedRef}</p>
                  <p className="text-sm text-body">
                    {refInstitution} &middot; {refProgramme}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-medium text-chocolate text-sm">
                    Generate Reference Slip
                  </h4>
                  <div>
                    <label className="block text-xs text-muted mb-1">
                      Institution
                    </label>
                    <div className="flex gap-2">
                      {Object.keys(INSTITUTION_PROGRAMMES).map((inst) => (
                        <button
                          key={inst}
                          onClick={() => {
                            setRefInstitution(inst);
                            setRefProgramme("");
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            refInstitution === inst
                              ? "bg-gold text-white"
                              : "bg-cream text-body hover:bg-gold/10"
                          }`}
                        >
                          {inst}
                        </button>
                      ))}
                    </div>
                  </div>
                  {refInstitution && (
                    <div>
                      <label className="block text-xs text-muted mb-1">
                        Programme
                      </label>
                      <select
                        value={refProgramme}
                        onChange={(e) => setRefProgramme(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-cream bg-white text-chocolate focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
                      >
                        <option value="">Select programme...</option>
                        {INSTITUTION_PROGRAMMES[refInstitution]?.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button
                    onClick={handleGenerateRef}
                    disabled={
                      !refInstitution || !refProgramme || refLoading
                    }
                    className="w-full py-2.5 rounded-xl bg-gold text-white font-medium hover:bg-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {refLoading
                      ? "Generating..."
                      : "Generate Reference Slip"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-chocolate text-white font-medium hover:bg-brown disabled:opacity-50 transition-all"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Notes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle Switch                                                      */
/* ------------------------------------------------------------------ */
function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <span className="text-sm text-chocolate">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-gold" : "bg-muted/30"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    booked: "bg-blue-50 text-blue-700",
    waiting: "bg-amber-50 text-amber-700",
    in_cabin: "bg-green-50 text-green-700",
    completed: "bg-emerald-50 text-emerald-700",
    no_show: "bg-red-50 text-red-600",
  };
  const labels: Record<string, string> = {
    booked: "Booked",
    waiting: "Waiting",
    in_cabin: "In Cabin",
    completed: "Completed",
    no_show: "No Show",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        styles[status] || "bg-gray-50 text-gray-600"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Portal                                                        */
/* ------------------------------------------------------------------ */
export default function CounsellorPortal() {
  const [auth, setAuth] = useState<CounsellorAuth | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"schedule" | "stats">(
    "schedule"
  );
  const [selectedSession, setSelectedSession] = useState<SessionRow | null>(
    null
  );
  const [notesSession, setNotesSession] = useState<SessionRow | null>(null);

  // Check for existing cookie on mount
  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("counsellor_token="));
    if (cookie) {
      try {
        const data = JSON.parse(
          decodeURIComponent(cookie.split("=").slice(1).join("="))
        );
        if (data.name) {
          setAuth({
            name: data.name,
            cabinId: data.cabinId || "",
            specialization: "",
          });
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/counsellor/schedule");
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth) fetchSchedule();
  }, [auth, fetchSchedule]);

  const handleLogout = () => {
    document.cookie =
      "counsellor_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setAuth(null);
    setSessions([]);
  };

  if (!auth) {
    return <LoginScreen onLogin={setAuth} />;
  }

  // Stats calculations
  const completedSessions = sessions.filter(
    (s) => s.status === "completed"
  ).length;
  const totalSessions = sessions.length;

  return (
    <div className="min-h-screen bg-ivory">
      {/* Top Bar */}
      <header className="bg-white border-b border-cream sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold text-chocolate">
                CareerArc
              </span>
              <span className="text-xs text-muted ml-2">
                Counsellor Portal
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-chocolate">
                {auth.name}
              </p>
              {auth.cabinId && (
                <p className="text-xs text-muted">
                  Cabin {auth.cabinId}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg text-sm text-coral hover:bg-coral/10 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Sessions"
            value={totalSessions.toString()}
            icon="calendar"
          />
          <StatCard
            label="Completed"
            value={completedSessions.toString()}
            icon="check"
          />
          <StatCard
            label="Waiting"
            value={sessions
              .filter((s) => s.status === "waiting")
              .length.toString()}
            icon="clock"
          />
          <StatCard
            label="Cabin"
            value={auth.cabinId || "N/A"}
            icon="home"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-cream rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab("schedule")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "schedule"
                ? "bg-white text-chocolate shadow-sm"
                : "text-body hover:text-chocolate"
            }`}
          >
            My Schedule
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "stats"
                ? "bg-white text-chocolate shadow-sm"
                : "text-body hover:text-chocolate"
            }`}
          >
            My Stats
          </button>
        </div>

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto" />
                <p className="text-muted text-sm mt-3">
                  Loading schedule...
                </p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-cream p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cream mb-4">
                  <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-chocolate mb-1">
                  No sessions today
                </h3>
                <p className="text-sm text-muted">
                  Sessions will appear here once students are booked.
                </p>
                <button
                  onClick={fetchSchedule}
                  className="mt-4 px-4 py-2 rounded-lg bg-gold/10 text-gold-dark text-sm font-medium hover:bg-gold/20 transition-colors"
                >
                  Refresh
                </button>
              </div>
            ) : (
              <>
                {/* Refresh button */}
                <div className="flex justify-end mb-2">
                  <button
                    onClick={fetchSchedule}
                    className="px-3 py-1.5 rounded-lg bg-gold/10 text-gold-dark text-sm font-medium hover:bg-gold/20 transition-colors"
                  >
                    Refresh
                  </button>
                </div>

                {/* Session list */}
                <div className="bg-white rounded-2xl border border-cream overflow-hidden">
                  {/* Table header - desktop */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-cream/50 text-xs font-medium text-muted uppercase tracking-wide">
                    <div className="col-span-3">Student</div>
                    <div className="col-span-2">Institution</div>
                    <div className="col-span-2">ARC-T</div>
                    <div className="col-span-1">Shift</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Actions</div>
                  </div>

                  {sessions.map((session) => (
                    <div
                      key={session.session_id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 border-b border-cream last:border-0 hover:bg-ivory/50 transition-colors items-center"
                    >
                      {/* Student */}
                      <div className="col-span-3">
                        <button
                          onClick={() => setSelectedSession(session)}
                          className="text-left group"
                        >
                          <p className="text-sm font-medium text-chocolate group-hover:text-gold transition-colors">
                            {session.student_name}
                          </p>
                          <p className="text-xs text-muted md:hidden">
                            {session.institution}
                          </p>
                        </button>
                      </div>

                      {/* Institution */}
                      <div className="col-span-2 hidden md:block">
                        <p className="text-sm text-body">
                          {session.institution}
                        </p>
                      </div>

                      {/* ARC-T */}
                      <div className="col-span-2 hidden md:block">
                        <p className="text-sm text-body">
                          {session.arct_roll || "N/A"}
                        </p>
                      </div>

                      {/* Shift */}
                      <div className="col-span-1 hidden md:block">
                        <p className="text-sm text-body">{session.shift || "-"}</p>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <StatusBadge status={session.status} />
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex gap-2">
                        <button
                          onClick={() => setSelectedSession(session)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cream text-body hover:bg-gold/10 hover:text-gold-dark transition-colors"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => setNotesSession(session)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gold/10 text-gold-dark hover:bg-gold/20 transition-colors"
                        >
                          Notes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-cream p-6">
              <h3 className="text-lg font-semibold text-chocolate mb-4">
                Today&apos;s Performance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-bold text-gold">
                    {totalSessions}
                  </p>
                  <p className="text-sm text-muted mt-1">
                    Total Sessions Assigned
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-600">
                    {completedSessions}
                  </p>
                  <p className="text-sm text-muted mt-1">
                    Sessions Completed
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-600">
                    {sessions.filter((s) => s.status === "waiting").length}
                  </p>
                  <p className="text-sm text-muted mt-1">Still Waiting</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-cream p-6">
              <h3 className="text-lg font-semibold text-chocolate mb-4">
                Completion Rate
              </h3>
              <div className="w-full bg-cream rounded-full h-4 mb-2">
                <div
                  className="bg-gold rounded-full h-4 transition-all"
                  style={{
                    width: `${
                      totalSessions > 0
                        ? Math.round(
                            (completedSessions / totalSessions) * 100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-sm text-muted">
                {totalSessions > 0
                  ? Math.round(
                      (completedSessions / totalSessions) * 100
                    )
                  : 0}
                % of today&apos;s sessions completed
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-cream p-6">
              <h3 className="text-lg font-semibold text-chocolate mb-4">
                Session Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Booked", status: "booked", color: "bg-blue-500" },
                  {
                    label: "Waiting",
                    status: "waiting",
                    color: "bg-amber-500",
                  },
                  {
                    label: "In Cabin",
                    status: "in_cabin",
                    color: "bg-green-500",
                  },
                  {
                    label: "Completed",
                    status: "completed",
                    color: "bg-emerald-500",
                  },
                  {
                    label: "No Show",
                    status: "no_show",
                    color: "bg-red-500",
                  },
                ].map(({ label, status, color }) => {
                  const count = sessions.filter(
                    (s) => s.status === status
                  ).length;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${color}`} />
                      <span className="text-sm text-body flex-1">
                        {label}
                      </span>
                      <span className="text-sm font-medium text-chocolate">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedSession && (
        <StudentProfileModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
      {notesSession && (
        <SessionNotesForm
          session={notesSession}
          onSaved={() => {
            setNotesSession(null);
            fetchSchedule();
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  const icons: Record<string, React.ReactNode> = {
    calendar: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    ),
    check: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    ),
    clock: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    home: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"
      />
    ),
  };

  return (
    <div className="bg-white rounded-2xl border border-cream p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-gold"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {icons[icon]}
          </svg>
        </div>
        <div>
          <p className="text-xl font-bold text-chocolate">{value}</p>
          <p className="text-xs text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}
