"use client";

import { useState, useEffect, useCallback } from "react";

type DebriefReport = {
  id: number;
  date: string;
  type: string;
  highlights: string;
  concerns: string;
  suggestions: string;
  fullReport: string;
  created_at: string;
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
        setError(data.error || "Failed to generate debrief");
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
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <div key={i} className="flex gap-2 py-0.5">
            <span className="text-gold mt-1 shrink-0">&#8226;</span>
            <span>{trimmed.slice(2)}</span>
          </div>
        );
      }
      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        return (
          <p key={i} className="font-semibold text-chocolate mt-2">
            {trimmed.replace(/\*\*/g, "")}
          </p>
        );
      }
      return <p key={i}>{trimmed}</p>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      <div className="flex items-center justify-between rounded-xl border border-gold/20 bg-cream p-4">
        <div>
          <h3 className="text-lg font-semibold text-chocolate">Claude Debrief Engine</h3>
          <p className="text-sm text-muted">AI-powered daily analysis of counselling data</p>
        </div>
        <button
          onClick={generateDebrief}
          disabled={generating}
          className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
            generating
              ? "cursor-wait bg-gold/40 text-brown/60"
              : "bg-gold text-white hover:bg-gold-dark shadow-sm hover:shadow"
          }`}
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </span>
          ) : (
            "Generate Daily Debrief"
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
        <div className="rounded-xl border-2 border-gold/30 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gold/10 bg-cream px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-chocolate">Latest Debrief</h4>
              <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold-dark">
                {latestReport.type}
              </span>
            </div>
            <span className="text-xs text-muted">{formatDate(latestReport.date)}</span>
          </div>
          <div className="p-5 space-y-4">
            {/* Full Report */}
            <div className="text-sm text-body leading-relaxed whitespace-pre-line">
              {renderMarkdown(latestReport.fullReport)}
            </div>
          </div>
        </div>
      )}

      {/* Report History */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-chocolate uppercase tracking-wide">
          Past Reports
        </h4>

        {loading ? (
          <div className="rounded-xl border border-gold/10 bg-white p-8 text-center text-muted text-sm">
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border border-gold/10 bg-white p-8 text-center text-muted text-sm">
            No debrief reports yet. Generate your first one above.
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border border-gold/15 bg-white overflow-hidden transition-shadow hover:shadow-sm"
              >
                {/* Header row - clickable */}
                <button
                  onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-ivory/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-chocolate">
                      {formatDate(report.date)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        report.type === "weekly"
                          ? "bg-zone-purple/10 text-zone-purple"
                          : "bg-gold/10 text-gold-dark"
                      }`}
                    >
                      {report.type}
                    </span>
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

                {/* Expandable content */}
                {expandedId === report.id && (
                  <div className="border-t border-gold/10 px-4 py-4 space-y-4">
                    {/* Highlights */}
                    {report.highlights && (
                      <div>
                        <h5 className="text-xs font-semibold text-gold uppercase tracking-wide mb-1">
                          Highlights
                        </h5>
                        <div className="rounded-lg bg-cream p-3 text-sm text-body">
                          {renderMarkdown(report.highlights)}
                        </div>
                      </div>
                    )}

                    {/* Concerns */}
                    {report.concerns && (
                      <div>
                        <h5 className="text-xs font-semibold text-coral uppercase tracking-wide mb-1">
                          Concerns / Flags
                        </h5>
                        <div className="rounded-lg bg-coral/5 p-3 text-sm text-body">
                          {renderMarkdown(report.concerns)}
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {report.suggestions && (
                      <div>
                        <h5 className="text-xs font-semibold text-zone-teal uppercase tracking-wide mb-1">
                          Suggestions
                        </h5>
                        <div className="rounded-lg bg-zone-teal/5 p-3 text-sm text-body">
                          {renderMarkdown(report.suggestions)}
                        </div>
                      </div>
                    )}

                    {/* Full Report toggle */}
                    {report.fullReport && (
                      <details className="group">
                        <summary className="cursor-pointer text-xs text-muted hover:text-gold-dark transition-colors">
                          View full Claude response
                        </summary>
                        <div className="mt-2 rounded-lg bg-ivory p-3 text-sm text-body whitespace-pre-line border border-gold/10">
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
