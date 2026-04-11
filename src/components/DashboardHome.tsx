"use client";

import { useState, useEffect, useCallback } from "react";

type DashboardData = {
  todayBar: {
    students: number;
    capacity: number;
    completed: number;
    in_progress: number;
    no_show: number;
    nps: number;
    rating: number;
  };
  progress: {
    guided: number;
    target: number;
    percentage: number;
  };
  counsellorGrid: {
    name: string;
    cabin_id: string;
    status: "free" | "occupied" | "break";
    current_student: string | null;
    sessions_done: number;
  }[];
  campusLive: Record<string, number>;
  streamPopularity: { stream: string; count: number }[];
  referralFunnel: {
    reference: number;
    reached: number;
    crm: number;
    admission: number;
  };
  careerKitStock: { item: string; current_stock: number; alert_threshold: number }[];
  alerts: { type: string; severity: string; message: string; timestamp: string }[];
  activityFeed: { user_name: string; action: string; entity_type: string; created_at: string }[];
};

export function DashboardHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) {
        setData(await res.json());
        setError("");
      } else {
        setError("Failed to load dashboard data");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="text-sm text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">{error || "No data available"}</p>
        <button onClick={fetchDashboard} className="mt-2 text-xs text-gold hover:underline">
          Retry
        </button>
      </div>
    );
  }

  const statusColor = (s: string) =>
    s === "free" ? "bg-green-500" : s === "occupied" ? "bg-amber-500" : "bg-red-500";

  const maxStream = data.streamPopularity.length > 0
    ? Math.max(...data.streamPopularity.map((s) => s.count))
    : 1;

  return (
    <div className="space-y-4">
      {/* Widget 1: Today's Bar */}
      <div className="rounded-xl border border-gold/20 bg-gradient-to-r from-chocolate to-brown px-6 py-4 text-white">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div>
            <span className="text-white/60">Students</span>{" "}
            <span className="text-lg font-bold">{data.todayBar.students}/{data.todayBar.capacity}</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div>
            <span className="text-white/60">Completed</span>{" "}
            <span className="text-lg font-bold text-green-300">{data.todayBar.completed}</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div>
            <span className="text-white/60">In Progress</span>{" "}
            <span className="text-lg font-bold text-amber-300">{data.todayBar.in_progress}</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div>
            <span className="text-white/60">No-Show</span>{" "}
            <span className="text-lg font-bold text-red-300">{data.todayBar.no_show}</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div>
            <span className="text-white/60">NPS</span>{" "}
            <span className="text-lg font-bold">{data.todayBar.nps || "—"}</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div>
            <span className="text-white/60">Rating</span>{" "}
            <span className="text-lg font-bold">{data.todayBar.rating || "—"}</span>
          </div>
        </div>
      </div>

      {/* Widget 2: Progress Bar */}
      <div className="rounded-xl border border-gold/20 bg-white p-6">
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-chocolate">Students Guided</h3>
          <span className="text-2xl font-bold text-chocolate">
            {data.progress.guided.toLocaleString()}{" "}
            <span className="text-sm font-normal text-muted">/ {data.progress.target.toLocaleString()}</span>
          </span>
        </div>
        <div className="h-6 overflow-hidden rounded-full bg-gray-100">
          <div
            className="flex h-full items-center justify-center rounded-full bg-gradient-to-r from-gold to-coral text-xs font-bold text-white transition-all duration-500"
            style={{ width: `${Math.min(100, data.progress.percentage)}%` }}
          >
            {data.progress.percentage}%
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Widget 3: Counsellor Grid */}
        <div className="rounded-xl border border-gold/20 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-chocolate">Counsellor Status</h3>
          <div className="grid grid-cols-2 gap-3">
            {data.counsellorGrid.length === 0 ? (
              <p className="col-span-2 text-center text-xs text-muted py-4">No counsellors assigned today</p>
            ) : (
              data.counsellorGrid.map((c) => (
                <div key={c.name} className="flex items-start gap-3 rounded-lg border border-gold/10 bg-ivory/50 p-3">
                  <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${statusColor(c.status)}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-chocolate">{c.name}</p>
                    <p className="text-xs text-muted">
                      {c.cabin_id ? `Cabin ${c.cabin_id}` : "No cabin"} &middot; {c.sessions_done}/6
                    </p>
                    {c.current_student && (
                      <p className="mt-0.5 truncate text-xs text-amber-700">
                        With: {c.current_student}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 4: Campus Live Mini */}
        <div className="rounded-xl border border-gold/20 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-chocolate">Campus Live</h3>
          <div className="flex items-center justify-between gap-1">
            {[
              { label: "Gate", key: "gate", color: "bg-blue-500" },
              { label: "Test", key: "test", color: "bg-purple-500" },
              { label: "Waiting", key: "waiting", color: "bg-amber-500" },
              { label: "Guidance", key: "guidance", color: "bg-green-500" },
              { label: "Exit", key: "exit", color: "bg-gray-500" },
            ].map((stage, i, arr) => (
              <div key={stage.key} className="flex items-center">
                <div className="text-center">
                  <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${stage.color} text-white text-lg font-bold`}>
                    {data.campusLive[stage.key] || 0}
                  </div>
                  <p className="mt-1 text-[10px] font-medium text-muted">{stage.label}</p>
                </div>
                {i < arr.length - 1 && (
                  <svg className="mx-1 h-4 w-4 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Widget 5: Stream Popularity */}
        <div className="rounded-xl border border-gold/20 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-chocolate">Top 5 Streams</h3>
          {data.streamPopularity.length === 0 ? (
            <p className="text-center text-xs text-muted py-4">No stream data yet</p>
          ) : (
            <div className="space-y-2">
              {data.streamPopularity.map((s) => (
                <div key={s.stream} className="flex items-center gap-3">
                  <div className="w-24 truncate text-xs font-medium text-chocolate">{s.stream}</div>
                  <div className="flex-1">
                    <div className="h-5 rounded-full bg-gray-100">
                      <div
                        className="flex h-5 items-center rounded-full bg-coral px-2 text-[10px] font-bold text-white"
                        style={{ width: `${Math.max(10, (s.count / maxStream) * 100)}%` }}
                      >
                        {s.count}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Widget 6: Referral Funnel */}
        <div className="rounded-xl border border-gold/20 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-chocolate">Referral Funnel</h3>
          <div className="space-y-2">
            {[
              { label: "Reference", count: data.referralFunnel.reference, color: "bg-blue-500", width: "100%" },
              { label: "Reached", count: data.referralFunnel.reached, color: "bg-amber-500", width: data.referralFunnel.reference > 0 ? `${Math.max(15, (data.referralFunnel.reached / data.referralFunnel.reference) * 100)}%` : "15%" },
              { label: "CRM", count: data.referralFunnel.crm, color: "bg-purple-500", width: data.referralFunnel.reference > 0 ? `${Math.max(10, (data.referralFunnel.crm / data.referralFunnel.reference) * 100)}%` : "10%" },
              { label: "Admission", count: data.referralFunnel.admission, color: "bg-green-500", width: data.referralFunnel.reference > 0 ? `${Math.max(5, (data.referralFunnel.admission / data.referralFunnel.reference) * 100)}%` : "5%" },
            ].map((stage) => (
              <div key={stage.label} className="mx-auto" style={{ width: stage.width }}>
                <div className={`flex items-center justify-between rounded-lg ${stage.color} px-3 py-2 text-white`}>
                  <span className="text-xs font-medium">{stage.label}</span>
                  <span className="text-sm font-bold">{stage.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 7: Career Kit Stock */}
        <div className="rounded-xl border border-gold/20 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-chocolate">Career Kit Stock</h3>
          {data.careerKitStock.length === 0 ? (
            <p className="text-center text-xs text-muted py-4">No inventory data. Visit the Inventory tab to set up.</p>
          ) : (
            <div className="max-h-48 space-y-1.5 overflow-y-auto">
              {data.careerKitStock.map((item) => {
                const isLow = item.current_stock < item.alert_threshold;
                return (
                  <div
                    key={item.item}
                    className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs ${
                      isLow ? "bg-red-50 text-red-700" : "bg-ivory/50 text-chocolate"
                    }`}
                  >
                    <span className="font-medium">{item.item}</span>
                    <span className={`font-bold ${isLow ? "text-red-600" : ""}`}>
                      {item.current_stock.toLocaleString()}
                      {isLow && " LOW"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Widget 8: Today's Alerts */}
        <div className="rounded-xl border border-gold/20 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-chocolate">
            Alerts{" "}
            {data.alerts.length > 0 && (
              <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {data.alerts.length}
              </span>
            )}
          </h3>
          {data.alerts.length === 0 ? (
            <p className="text-center text-xs text-muted py-4">All clear - no active alerts</p>
          ) : (
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {data.alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-2 text-xs ${
                    alert.severity === "HIGH"
                      ? "border border-red-200 bg-red-50 text-red-700"
                      : alert.severity === "MEDIUM"
                      ? "border border-amber-200 bg-amber-50 text-amber-700"
                      : "border border-blue-200 bg-blue-50 text-blue-700"
                  }`}
                >
                  <span className="font-semibold">{alert.type.replace(/_/g, " ")}:</span> {alert.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Widget 9: Activity Feed (full width) */}
      <div className="rounded-xl border border-gold/20 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-chocolate">Activity Feed</h3>
        {data.activityFeed.length === 0 ? (
          <p className="text-center text-xs text-muted py-4">No recent activity</p>
        ) : (
          <div className="space-y-2">
            {data.activityFeed.map((a, i) => (
              <div key={i} className="flex items-start gap-3 border-b border-gold/5 pb-2 last:border-0">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-chocolate">
                    <span className="font-semibold">{a.user_name || "System"}</span>{" "}
                    {a.action}
                  </p>
                  <p className="text-[10px] text-muted">
                    {a.entity_type && <span className="mr-2 rounded bg-gray-100 px-1.5 py-0.5">{a.entity_type}</span>}
                    {new Date(a.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
