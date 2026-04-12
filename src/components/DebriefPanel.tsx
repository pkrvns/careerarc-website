"use client";

import { useState, useEffect, useCallback } from "react";

type DebriefAlert = {
  type: string;
  title: string;
  detail: string;
  severity: "HIGH" | "MEDIUM" | "INFO";
};

type DebriefReport = {
  id: number;
  date: string;
  type: string;
  dayNumber: number;
  scorecard: string;
  highlights: string;
  concerns: string;
  studentVoice: string;
  tomorrowPrep: string;
  updatesNeeded: string;
  healthScore: number | null;
  alerts: string | DebriefAlert[];
  fullReport: string;
  created_at: string;
};

const SECTION_CONFIG = [
  { key: "scorecard", label: "Today's Scorecard", color: "gold", icon: "S" },
  { key: "highlights", label: "Highlights", color: "green", icon: "H" },
  { key: "concerns", label: "Concerns", color: "red", icon: "C" },
  { key: "studentVoice", label: "Student Voice", color: "blue", icon: "V" },
  { key: "tomorrowPrep", label: "Tomorrow's Prep", color: "amber", icon: "P" },
  { key: "updatesNeeded", label: "Manual Updates", color: "purple", icon: "U" },
] as const;

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  gold: { bg: "bg-gold/5", text: "text-gold-dark", border: "border-gold/20" },
  green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
};

export function DebriefPanel() {
  const [reports, setReports] = useState<DebriefReport[]>([]);
  const [generating, setGenerating] = useState(false);
  const [latestReport, setLatestReport] = useState<DebriefReport | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/debrief");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const generateDebrief = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/debrief", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.report) {
        setLatestReport(data.report);
        setReports((prev) => [data.report, ...prev]);
      } else {
        setError(data.error || data.detail || "Failed to generate debrief");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setGenerating(false);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={i} />;
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
        const content = trimmed.replace(/^[-*•]\s*/, "");
        return (
          <div key={i} className="flex gap-2 py-0.5">
            <span className="mt-0.5 shrink-0 text-gold">&#8226;</span>
            <span dangerouslySetInnerHTML={{ __html: formatBold(content) }} />
          </div>
        );
      }
      if (trimmed.startsWith("✅") || trimmed.startsWith("⚠️") || trimmed.startsWith("❌")) {
        return (
          <p key={i} className="py-0.5 font-medium">
            {trimmed}
          </p>
        );
      }
      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        return (
          <p key={i} className="mt-2 font-semibold text-chocolate">
            {trimmed.replace(/\*\*/g, "")}
          </p>
        );
      }
      return <p key={i} dangerouslySetInnerHTML={{ __html: formatBold(trimmed) }} />;
    });
  };

  const formatBold = (text: string) => {
    return text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  };

  const parseAlerts = (alerts: string | DebriefAlert[]): DebriefAlert[] => {
    if (Array.isArray(alerts)) return alerts;
    try {
      return JSON.parse(alerts);
    } catch {
      return [];
    }
  };

  const renderSectionCards = (report: DebriefReport) => {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {SECTION_CONFIG.map(({ key, label, color, icon }) => {
          const content = report[key as keyof DebriefReport] as string;
          if (!content) return null;
          const c = COLOR_MAP[color];
          return (
            <div key={key} className={`rounded-lg border ${c.border} ${c.bg} p-4`}>
              <div className="mb-2 flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full ${c.text} bg-white text-xs font-bold`}>
                  {icon}
                </div>
                <h5 className={`text-xs font-semibold uppercase tracking-wide ${c.text}`}>
                  {label}
                </h5>
              </div>
              <div className="text-sm text-body leading-relaxed">
                {renderMarkdown(content)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header + Generate Button */}
      <div className="flex items-center justify-between rounded-xl border border-gold/20 bg-cream p-4">
        <div>
          <h3 className="text-lg font-semibold text-chocolate">Claude Debrief Engine</h3>
          <p className="text-sm text-muted">AI-powered daily programme analysis</p>
        </div>
        <button
          onClick={generateDebrief}
          disabled={generating}
          className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
            generating
              ? "cursor-wait bg-gold/40 text-brown/60"
              : "bg-gold text-white shadow-sm hover:bg-gold-dark hover:shadow"
          }`}
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analysing...
            </span>
          ) : (
            "Generate Debrief"
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Latest Generated Report */}
      {latestReport && (
        <div className="overflow-hidden rounded-xl border-2 border-gold/30 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gold/10 bg-cream px-5 py-3">
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-chocolate">Latest Debrief</h4>
              <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold-dark">
                Day {latestReport.dayNumber} — {latestReport.type}
              </span>
              {latestReport.healthScore && (
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Health: {latestReport.healthScore}/10
                </span>
              )}
            </div>
            <span className="text-xs text-muted">{formatDate(latestReport.date)}</span>
          </div>

          {/* Alerts banner */}
          {parseAlerts(latestReport.alerts).length > 0 && (
            <div className="border-b border-red-100 bg-red-50 px-5 py-2">
              <div className="flex flex-wrap gap-2">
                {parseAlerts(latestReport.alerts).map((a, i) => (
                  <span
                    key={i}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      a.severity === "HIGH"
                        ? "bg-red-100 text-red-700"
                        : a.severity === "MEDIUM"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {a.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section cards */}
          <div className="p-5">
            {renderSectionCards(latestReport)}

            {/* Full report toggle */}
            <details className="group mt-4">
              <summary className="cursor-pointer text-xs text-muted transition-colors hover:text-gold-dark">
                View full Claude response
              </summary>
              <div className="mt-2 rounded-lg border border-gold/10 bg-ivory p-3 text-sm text-body leading-relaxed whitespace-pre-line">
                {renderMarkdown(latestReport.fullReport)}
              </div>
            </details>
          </div>
        </div>
      )}

      {/* Report History */}
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-chocolate">
          Past Reports
        </h4>

        {loading ? (
          <div className="rounded-xl border border-gold/10 bg-white p-8 text-center text-sm text-muted">
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border border-gold/10 bg-white p-8 text-center text-sm text-muted">
            No debrief reports yet. Generate your first one above.
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="overflow-hidden rounded-xl border border-gold/15 bg-white transition-shadow hover:shadow-sm"
              >
                {/* Header row */}
                <button
                  onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-ivory/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-chocolate">
                      {formatDate(report.date)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        report.type === "weekly"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gold/10 text-gold-dark"
                      }`}
                    >
                      Day {report.dayNumber} — {report.type}
                    </span>
                    {parseAlerts(report.alerts).filter((a) => a.severity === "HIGH").length > 0 && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                        {parseAlerts(report.alerts).filter((a) => a.severity === "HIGH").length} alert(s)
                      </span>
                    )}
                  </div>
                  <svg
                    className={`h-4 w-4 text-muted transition-transform ${
                      expandedId === report.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded content */}
                {expandedId === report.id && (
                  <div className="border-t border-gold/10 p-4">
                    {renderSectionCards(report)}

                    {report.fullReport && (
                      <details className="group mt-4">
                        <summary className="cursor-pointer text-xs text-muted transition-colors hover:text-gold-dark">
                          View full Claude response
                        </summary>
                        <div className="mt-2 rounded-lg border border-gold/10 bg-ivory p-3 text-sm text-body whitespace-pre-line">
                          {renderMarkdown(report.fullReport)}
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
