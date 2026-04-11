"use client";

import { useState, useEffect, useCallback } from "react";

/* ---------- types ---------- */
interface RepUser {
  name: string;
  phone: string;
  department: string;
}

interface Referral {
  id: number;
  ref_code: string;
  student_id: number;
  counsellor_name: string;
  institution: string;
  programme: string;
  status: string;
  rep_name: string;
  reached_at: string | null;
  crm_at: string | null;
  admission_at: string | null;
  created_at: string;
  student_name: string;
  student_phone: string;
}

interface Stats {
  total: number;
  reached: number;
  crm: number;
  admission: number;
}

const STATUS_ORDER = ["reference", "reached", "crm", "admission"] as const;

const STATUS_LABELS: Record<string, string> = {
  reference: "NEW",
  reached: "REACHED",
  crm: "CRM",
  admission: "ADMISSION",
};

const STATUS_COLORS: Record<string, string> = {
  reference: "bg-blue-100 text-blue-800 border-blue-300",
  reached: "bg-amber-100 text-amber-800 border-amber-300",
  crm: "bg-purple-100 text-purple-800 border-purple-300",
  admission: "bg-green-100 text-green-800 border-green-300",
};

/* ---------- helpers ---------- */
function formatTime(ts: string | null) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

/* ================================================================
   LOGIN SCREEN
   ================================================================ */
function LoginScreen({ onLogin }: { onLogin: (u: RepUser) => void }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/rep/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }
      // Read the cookie that was just set
      const raw = getCookie("rep_token");
      if (raw) {
        onLogin(JSON.parse(raw));
      } else {
        onLogin({ name: data.name, phone, department: data.department });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gold flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-chocolate font-semibold text-xl">CareerArc</span>
          </div>
          <h1 className="text-2xl font-bold text-chocolate">Institution Portal</h1>
          <p className="text-body mt-1">Sign in with your registered phone number</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-cream p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-chocolate mb-2">Mobile Number</label>
            <input
              type="tel"
              maxLength={10}
              placeholder="Enter 10-digit mobile"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory text-chocolate placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
            />
          </div>

          {error && (
            <div className="text-coral text-sm bg-coral/10 rounded-lg px-4 py-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="w-full py-3 rounded-xl bg-gold text-white font-semibold hover:bg-gold-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ================================================================
   STATUS UPDATE MODAL
   ================================================================ */
function StatusModal({
  referral,
  onClose,
  onUpdate,
}: {
  referral: Referral;
  onClose: () => void;
  onUpdate: (id: number, status: string, notes: string) => void;
}) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const currentIdx = STATUS_ORDER.indexOf(referral.status as typeof STATUS_ORDER[number]);
  const nextStatus = currentIdx < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIdx + 1] : null;

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setSaving(true);
    await onUpdate(referral.id, nextStatus, notes);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl border border-cream w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-cream">
          <h3 className="text-lg font-bold text-chocolate">Update Referral</h3>
          <p className="text-sm text-muted">Ref: {referral.ref_code}</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Student info */}
          <div className="bg-ivory rounded-xl p-4 space-y-1">
            <p className="font-semibold text-chocolate">{referral.student_name || "Unknown Student"}</p>
            <p className="text-sm text-body">{referral.student_phone}</p>
            <p className="text-sm text-body">Programme: {referral.programme}</p>
            <p className="text-sm text-muted">Referred by: {referral.counsellor_name}</p>
          </div>

          {/* Funnel progress */}
          <div className="flex items-center gap-1">
            {STATUS_ORDER.map((s, i) => {
              const reached = i <= currentIdx;
              return (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`flex-1 h-2 rounded-full ${reached ? "bg-gold" : "bg-cream"}`}
                  />
                  {i < STATUS_ORDER.length - 1 && <div className="w-1" />}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted px-1">
            {STATUS_ORDER.map((s) => (
              <span key={s}>{STATUS_LABELS[s]}</span>
            ))}
          </div>

          {/* Current status */}
          <div className="text-center">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[referral.status]}`}>
              Current: {STATUS_LABELS[referral.status]}
            </span>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-2 text-xs text-muted">
            <span>Created: {formatTime(referral.created_at)}</span>
            {referral.reached_at && <span>Reached: {formatTime(referral.reached_at)}</span>}
            {referral.crm_at && <span>CRM: {formatTime(referral.crm_at)}</span>}
            {referral.admission_at && <span>Admission: {formatTime(referral.admission_at)}</span>}
          </div>

          {/* Notes field + next action */}
          {nextStatus ? (
            <>
              <div>
                <label className="block text-sm font-medium text-chocolate mb-1">Notes (optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={`Add notes for moving to ${STATUS_LABELS[nextStatus]}...`}
                  className="w-full px-4 py-2 rounded-xl border border-cream bg-ivory text-chocolate placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
                />
              </div>
              <button
                onClick={handleAdvance}
                disabled={saving}
                className="w-full py-3 rounded-xl bg-gold text-white font-semibold hover:bg-gold-dark transition disabled:opacity-50"
              >
                {saving
                  ? "Updating..."
                  : `Move to ${STATUS_LABELS[nextStatus]}`}
              </button>
            </>
          ) : (
            <p className="text-center text-green-700 font-medium bg-green-50 rounded-xl py-3">
              This referral has reached Admission stage
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cream">
          <button onClick={onClose} className="text-sm text-muted hover:text-chocolate transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   REFERRALS TAB
   ================================================================ */
function ReferralsTab({
  referrals,
  onSelect,
}: {
  referrals: Referral[];
  onSelect: (r: Referral) => void;
}) {
  if (referrals.length === 0) {
    return (
      <div className="text-center py-16 text-muted">
        <svg className="mx-auto w-16 h-16 mb-4 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-medium">No referrals yet</p>
        <p className="text-sm">Referrals from counsellors will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {referrals.map((r) => (
        <button
          key={r.id}
          onClick={() => onSelect(r)}
          className="w-full text-left bg-white rounded-xl border border-cream p-4 hover:border-gold/40 hover:shadow-md transition group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-chocolate truncate">
                  {r.student_name || "Unknown Student"}
                </p>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[r.status]}`}>
                  {STATUS_LABELS[r.status]}
                </span>
              </div>
              <p className="text-sm text-body">{r.student_phone}</p>
              <p className="text-sm text-body">Programme: <span className="text-chocolate font-medium">{r.programme}</span></p>
              <p className="text-xs text-muted mt-1">
                Counsellor: {r.counsellor_name} &middot; {formatTime(r.created_at)}
              </p>
            </div>
            <svg className="w-5 h-5 text-muted group-hover:text-gold transition shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ================================================================
   FUNNEL TAB
   ================================================================ */
function FunnelTab({ stats }: { stats: Stats }) {
  const stages = [
    { label: "Reference", count: stats.total, color: "bg-blue-500" },
    { label: "Reached", count: stats.reached, color: "bg-amber-500" },
    { label: "CRM", count: stats.crm, color: "bg-purple-500" },
    { label: "Admission", count: stats.admission, color: "bg-green-500" },
  ];

  const maxCount = Math.max(stats.total, 1);

  return (
    <div className="space-y-6">
      {/* Funnel visualization */}
      <div className="bg-white rounded-2xl border border-cream p-6">
        <h3 className="text-lg font-bold text-chocolate mb-6">Conversion Funnel</h3>
        <div className="space-y-4">
          {stages.map((stage) => {
            const pct = stats.total > 0 ? Math.round((stage.count / maxCount) * 100) : 0;
            return (
              <div key={stage.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-chocolate">{stage.label}</span>
                  <span className="text-sm text-body">
                    {stage.count} {stats.total > 0 && `(${pct}%)`}
                  </span>
                </div>
                <div className="w-full h-8 bg-cream rounded-lg overflow-hidden">
                  <div
                    className={`h-full rounded-lg ${stage.color} transition-all duration-700`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversion rates */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-cream p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">
            {stats.total > 0 ? Math.round((stats.reached / stats.total) * 100) : 0}%
          </p>
          <p className="text-xs text-muted mt-1">Reach Rate</p>
        </div>
        <div className="bg-white rounded-xl border border-cream p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {stats.reached > 0 ? Math.round((stats.crm / stats.reached) * 100) : 0}%
          </p>
          <p className="text-xs text-muted mt-1">CRM Rate</p>
        </div>
        <div className="bg-white rounded-xl border border-cream p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {stats.crm > 0 ? Math.round((stats.admission / stats.crm) * 100) : 0}%
          </p>
          <p className="text-xs text-muted mt-1">Admission Rate</p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function RepPortal() {
  const [user, setUser] = useState<RepUser | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, reached: 0, crm: 0, admission: 0 });
  const [activeTab, setActiveTab] = useState<"referrals" | "funnel">("referrals");
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);

  // Check existing cookie on mount
  useEffect(() => {
    const raw = getCookie("rep_token");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // Fetch referrals when logged in
  const fetchReferrals = useCallback(async () => {
    try {
      const res = await fetch("/api/rep/referrals");
      if (!res.ok) {
        if (res.status === 401) {
          setUser(null);
          document.cookie = "rep_token=; path=/; max-age=0";
        }
        return;
      }
      const data = await res.json();
      setReferrals(data.referrals || []);
      setStats(data.stats || { total: 0, reached: 0, crm: 0, admission: 0 });
    } catch (err) {
      console.error("Failed to fetch referrals:", err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchReferrals();
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchReferrals, 30000);
    return () => clearInterval(interval);
  }, [user, fetchReferrals]);

  const handleStatusUpdate = async (id: number, status: string, notes: string) => {
    try {
      const res = await fetch("/api/rep/referrals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, notes }),
      });
      if (res.ok) {
        await fetchReferrals();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleLogout = () => {
    document.cookie = "rep_token=; path=/; max-age=0";
    setUser(null);
    setReferrals([]);
    setStats({ total: 0, reached: 0, crm: 0, admission: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-ivory">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-cream shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div>
              <span className="text-chocolate font-semibold text-sm">CareerArc</span>
              <span className="text-muted text-xs ml-2 hidden sm:inline">Institution Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-chocolate">{user.name}</p>
              <p className="text-xs text-muted">{user.department}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-coral hover:text-coral-dark font-medium transition px-3 py-1.5 rounded-lg hover:bg-coral/10"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome + Institution */}
        <div className="bg-white rounded-2xl border border-cream p-5">
          <h1 className="text-xl font-bold text-chocolate">{user.department}</h1>
          <p className="text-sm text-body mt-1">Welcome, {user.name}. Manage your incoming referrals below.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-cream p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-muted mt-1">Total Referrals</p>
          </div>
          <div className="bg-white rounded-xl border border-cream p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.reached}</p>
            <p className="text-xs text-muted mt-1">Reached</p>
          </div>
          <div className="bg-white rounded-xl border border-cream p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.crm}</p>
            <p className="text-xs text-muted mt-1">CRM</p>
          </div>
          <div className="bg-white rounded-xl border border-cream p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.admission}</p>
            <p className="text-xs text-muted mt-1">Admission</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-cream rounded-xl p-1">
          <button
            onClick={() => setActiveTab("referrals")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === "referrals"
                ? "bg-white text-chocolate shadow-sm"
                : "text-muted hover:text-body"
            }`}
          >
            Incoming Referrals
          </button>
          <button
            onClick={() => setActiveTab("funnel")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === "funnel"
                ? "bg-white text-chocolate shadow-sm"
                : "text-muted hover:text-body"
            }`}
          >
            My Funnel
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "referrals" ? (
          <ReferralsTab referrals={referrals} onSelect={setSelectedReferral} />
        ) : (
          <FunnelTab stats={stats} />
        )}
      </div>

      {/* Status Update Modal */}
      {selectedReferral && (
        <StatusModal
          referral={selectedReferral}
          onClose={() => setSelectedReferral(null)}
          onUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
