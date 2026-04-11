"use client";

import { useState, useEffect, useCallback } from "react";

type Alert = {
  type: string;
  severity: "HIGH" | "MEDIUM" | "INFO";
  message: string;
  timestamp: string;
};

type Activity = {
  id: number;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: number;
  metadata: string;
  created_at: string;
};

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  HIGH: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
  MEDIUM: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  INFO: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
};

const ACTION_LABELS: Record<string, string> = {
  collected_feedback: "Feedback Collected",
  registered_walkin: "Walk-in Registered",
  session_started: "Session Started",
  session_completed: "Session Completed",
  reference_created: "Reference Created",
  reference_reached: "Reference Reached",
};

export function NotificationsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [alertLoading, setAlertLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [error, setError] = useState("");

  const fetchActivities = useCallback(async () => {
    setActivityLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.set("type", actionFilter);
      const res = await fetch(`/api/admin/activity?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load activity feed");
      const json = await res.json();
      setActivities(json.activities || []);
    } catch {
      setError("Failed to load activity feed");
    } finally {
      setActivityLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    fetchAlerts();
    fetchActivities();
  }, [fetchActivities]);

  const fetchAlerts = async () => {
    setAlertLoading(true);
    try {
      const res = await fetch("/api/admin/alerts");
      if (!res.ok) throw new Error("Failed to load alerts");
      const json = await res.json();
      setAlerts(json.alerts || []);
    } catch {
      setError("Failed to load alerts");
    } finally {
      setAlertLoading(false);
    }
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return ts;
    }
  };

  const uniqueActions = Array.from(new Set(activities.map((a) => a.action)));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-chocolate">Notifications & Alerts</h2>
        <button
          onClick={() => { fetchAlerts(); fetchActivities(); }}
          className="px-4 py-2 bg-cream text-brown rounded-xl text-sm hover:bg-gold-light/30 transition border border-gold/20"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* ─── AUTO-ALERTS ─── */}
      <section>
        <h3 className="text-lg font-semibold text-chocolate mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-coral inline-block" />
          System Alerts
        </h3>

        {alertLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-cream rounded-xl p-6 border border-gold/10 text-center">
            <p className="text-muted text-sm">All clear — no alerts at this time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, i) => {
              const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.INFO;
              return (
                <div
                  key={`${alert.type}-${i}`}
                  className={`${style.bg} ${style.border} border rounded-xl p-4 flex items-start gap-3`}
                >
                  <span className={`${style.dot} w-2.5 h-2.5 rounded-full mt-1.5 shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text} border ${style.border}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-muted">{alert.type.replace(/_/g, " ")}</span>
                    </div>
                    <p className={`text-sm ${style.text}`}>{alert.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── ACTIVITY FEED ─── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-chocolate flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold inline-block" />
            Activity Feed
          </h3>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-xl bg-ivory border border-gold/20 text-body focus:outline-none focus:ring-2 focus:ring-gold/30"
          >
            <option value="">All Actions</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {ACTION_LABELS[action] || action.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {activityLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-cream rounded-xl p-6 border border-gold/10 text-center">
            <p className="text-muted text-sm">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="bg-cream rounded-xl border border-gold/10 overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-cream z-10">
                  <tr className="border-b border-gold/10">
                    <th className="text-left py-3 px-4 text-muted font-medium">Time</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">User</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Action</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Entity</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a) => (
                    <tr key={a.id} className="border-b border-gold/5 hover:bg-ivory/50 transition">
                      <td className="py-2.5 px-4 text-muted text-xs whitespace-nowrap">
                        {formatTime(a.created_at)}
                      </td>
                      <td className="py-2.5 px-4 text-chocolate font-medium">
                        {a.user_name || "System"}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-gold/10 text-gold-dark border border-gold/15">
                          {ACTION_LABELS[a.action] || a.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-body text-xs">
                        {a.entity_type && (
                          <span className="text-muted">
                            {a.entity_type} #{a.entity_id}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
