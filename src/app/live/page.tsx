"use client";

import { useEffect, useState, useCallback } from "react";

/* ---------- Types ---------- */
interface CampusFlow {
  gate: number;
  riasec: number;
  waiting: number;
  counselling: number;
  feedback: number;
  exit: number;
}

interface Counsellor {
  name: string;
  cabinId: string | null;
  status: "free" | "occupied" | "break";
  currentStudent: string | null;
  sessionsToday: number;
}

interface TodayStats {
  total: number;
  target: number;
  avgRating: number;
  nps: number;
  testimonials: number;
  noShows: number;
  references: number;
}

interface ActivityItem {
  text: string;
  time: string;
}

interface LiveData {
  campusFlow: CampusFlow;
  counsellors: Counsellor[];
  todayStats: TodayStats;
  activity: ActivityItem[];
  cumulative: { counselled: number; target: number };
}

/* ---------- Helpers ---------- */
function formatDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

/* ---------- Sub-components ---------- */

function FlowStage({
  label,
  count,
  color,
  isActive,
}: {
  label: string;
  count: number;
  color: string;
  isActive: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative rounded-xl px-5 py-4 min-w-[90px] text-center border-2 transition-all duration-500 ${color}`}
        style={isActive ? { boxShadow: `0 0 20px rgba(197, 151, 62, 0.4)` } : {}}
      >
        {isActive && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        )}
        <div className="text-3xl font-bold">{count}</div>
      </div>
      <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">{label}</span>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex items-center px-1 self-start mt-5">
      <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
        <path
          d="M0 8H28M28 8L22 2M28 8L22 14"
          stroke="#C5973E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function CounsellorCard({ c }: { c: Counsellor }) {
  const statusColors: Record<string, { bg: string; dot: string; label: string }> = {
    free: { bg: "border-green-500/40 bg-green-500/10", dot: "bg-green-400", label: "Free" },
    occupied: { bg: "border-amber-500/40 bg-amber-500/10", dot: "bg-amber-400", label: "Occupied" },
    break: { bg: "border-red-500/40 bg-red-500/10", dot: "bg-red-400", label: "Break" },
  };
  const s = statusColors[c.status] || statusColors.free;

  return (
    <div className={`rounded-lg border-2 p-3 ${s.bg} transition-all duration-300`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-sm truncate mr-2">{c.name}</span>
        <span className={`w-2.5 h-2.5 rounded-full ${s.dot} ${c.status === "occupied" ? "animate-pulse" : ""}`} />
      </div>
      {c.cabinId && (
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
          Cabin {c.cabinId}
        </div>
      )}
      {c.status === "occupied" && c.currentStudent && (
        <div className="text-xs text-amber-300 truncate mb-1">
          {c.currentStudent}
        </div>
      )}
      <div className="text-xs text-gray-400">
        {c.sessionsToday} session{c.sessionsToday !== 1 ? "s" : ""} today
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-4">
      <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent || "text-white"}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

/* ---------- Main Dashboard ---------- */

export default function LiveDashboard() {
  const [data, setData] = useState<LiveData | null>(null);
  const [clock, setClock] = useState(formatTime());
  const [tickerOffset, setTickerOffset] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/live", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // silently retry on next poll
    }
  }, []);

  // Polling every 10 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Real-time clock every second
  useEffect(() => {
    const interval = setInterval(() => setClock(formatTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Ticker auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerOffset((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gold text-lg">Loading Live Dashboard...</p>
        </div>
      </div>
    );
  }

  const flow = data.campusFlow;
  const stages: { key: keyof CampusFlow; label: string; color: string }[] = [
    { key: "gate", label: "Gate", color: "border-blue-400 bg-blue-500/20 text-blue-300" },
    { key: "riasec", label: "RIASEC", color: "border-purple-400 bg-purple-500/20 text-purple-300" },
    { key: "waiting", label: "Waiting", color: "border-amber-400 bg-amber-500/20 text-amber-300" },
    { key: "counselling", label: "Counselling", color: "border-green-400 bg-green-500/20 text-green-300" },
    { key: "feedback", label: "Feedback", color: "border-teal-400 bg-teal-500/20 text-teal-300" },
    { key: "exit", label: "Exit", color: "border-gray-400 bg-gray-500/20 text-gray-300" },
  ];

  const pct = data.cumulative.target > 0
    ? Math.min(100, Math.round((data.cumulative.counselled / data.cumulative.target) * 100))
    : 0;

  const visibleActivity = data.activity.length > 0
    ? data.activity
    : [{ text: "No recent activity", time: "--" }];
  const currentTickerIdx = tickerOffset % visibleActivity.length;

  return (
    <div className="h-screen flex flex-col p-4 gap-3 select-none" style={{ fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>
      {/* ===== HEADER BAR ===== */}
      <header className="flex items-center justify-between bg-white/5 backdrop-blur rounded-xl border border-white/10 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-gold">CareerArc</span>{" "}
            <span className="text-white/80">Live</span>
          </h1>
        </div>
        <div className="text-sm text-gray-400 hidden md:block">{formatDate()}</div>
        <div className="text-lg font-mono text-gold tabular-nums">{clock}</div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-gold tabular-nums">
              {data.cumulative.counselled.toLocaleString()}
              <span className="text-sm text-gray-400 font-normal"> / {data.cumulative.target.toLocaleString()}</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">counselled</div>
          </div>
          <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-coral transition-all duration-1000"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* --- Campus Flow Map (left ~5 cols) --- */}
        <section className="col-span-12 lg:col-span-5 bg-white/5 backdrop-blur rounded-xl border border-white/10 p-5 flex flex-col">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Campus Flow
          </h2>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-start gap-1 flex-wrap justify-center">
              {stages.map((stage, i) => (
                <div key={stage.key} className="flex items-start">
                  <FlowStage
                    label={stage.label}
                    count={flow[stage.key]}
                    color={stage.color}
                    isActive={flow[stage.key] > 0}
                  />
                  {i < stages.length - 1 && <FlowArrow />}
                </div>
              ))}
            </div>
          </div>
          {/* Flow summary */}
          <div className="flex gap-4 mt-3 pt-3 border-t border-white/5 text-xs text-gray-500">
            <span>
              In campus:{" "}
              <span className="text-white font-medium">
                {Object.values(flow).reduce((a, b) => a + b, 0)}
              </span>
            </span>
            <span>
              In counselling:{" "}
              <span className="text-green-400 font-medium">{flow.counselling}</span>
            </span>
            <span>
              Waiting:{" "}
              <span className="text-amber-400 font-medium">{flow.waiting}</span>
            </span>
          </div>
        </section>

        {/* --- Counsellor Grid (center ~4 cols) --- */}
        <section className="col-span-12 lg:col-span-4 bg-white/5 backdrop-blur rounded-xl border border-white/10 p-5 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Counsellors
            </h2>
            <div className="flex gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400" /> Free
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Busy
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Break
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 auto-rows-min pr-1">
            {data.counsellors.length > 0 ? (
              data.counsellors.map((c, i) => <CounsellorCard key={i} c={c} />)
            ) : (
              <div className="col-span-2 flex items-center justify-center text-gray-500 text-sm py-8">
                No counsellors registered
              </div>
            )}
          </div>
        </section>

        {/* --- Today's Stats (right ~3 cols) --- */}
        <section className="col-span-12 lg:col-span-3 bg-white/5 backdrop-blur rounded-xl border border-white/10 p-5 flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Today&apos;s Stats
          </h2>
          <StatCard
            label="Sessions Today"
            value={data.todayStats.total}
            sub={`Target: ${data.todayStats.target}`}
            accent="text-gold"
          />
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Avg Rating" value={data.todayStats.avgRating || "--"} accent="text-green-400" />
            <StatCard label="NPS" value={data.todayStats.nps || "--"} accent="text-blue-400" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Testimonials" value={data.todayStats.testimonials} />
            <StatCard label="No-Shows" value={data.todayStats.noShows} accent="text-red-400" />
          </div>
          <StatCard label="References" value={data.todayStats.references} accent="text-coral" />

          {/* Progress ring */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#C5973E"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - (data.todayStats.total / Math.max(data.todayStats.target, 1)))}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gold">
                  {data.todayStats.target > 0
                    ? Math.round((data.todayStats.total / data.todayStats.target) * 100)
                    : 0}%
                </span>
                <span className="text-[9px] text-gray-500 uppercase">of target</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ===== ACTIVITY TICKER ===== */}
      <footer className="bg-white/5 backdrop-blur rounded-xl border border-white/10 px-6 py-2.5 flex items-center gap-4 overflow-hidden">
        <span className="text-[10px] uppercase tracking-wider text-gold font-semibold whitespace-nowrap">
          Live Feed
        </span>
        <div className="w-px h-4 bg-white/20" />
        <div className="flex-1 overflow-hidden relative h-6">
          <div
            className="absolute inset-0 flex items-center transition-transform duration-700 ease-in-out"
            style={{ transform: `translateY(-${currentTickerIdx * 24}px)` }}
          >
            <div className="flex flex-col">
              {visibleActivity.map((item, i) => (
                <div key={i} className="h-6 flex items-center gap-3 whitespace-nowrap">
                  <span className="text-xs text-gold font-mono">{item.time}</span>
                  <span className="text-xs text-gray-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-[10px] text-gray-600 whitespace-nowrap">
          Auto-refresh: 10s
        </div>
      </footer>
    </div>
  );
}
