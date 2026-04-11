"use client";

import { useState, useEffect } from "react";

type FeedbackData = {
  avgRating: number;
  avgNps: number;
  totalFeedback: number;
  ratingDistribution: number[];
  streamPopularity: Record<string, number>;
  topWords: string[];
};

type StudentData = {
  totalCounselled: number;
  totalBooked: number;
  showUpRate: number;
  guestCount: number;
  arctCount: number;
  byInstitution: { name: string; count: number }[];
  byStream: Record<string, number>;
};

type CounsellorData = {
  name: string;
  sessions: number;
  avgRating: number;
  avgNps: number;
};

type AnalyticsData = {
  feedback: FeedbackData;
  students: StudentData;
  counsellors: CounsellorData[];
};

export function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Failed to load analytics");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-coral font-medium">{error}</p>
        <button onClick={fetchAnalytics} className="mt-3 px-4 py-2 bg-gold text-white rounded-xl text-sm hover:bg-gold-dark transition">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { feedback, students, counsellors } = data;
  const maxRating = Math.max(...feedback.ratingDistribution, 1);
  const streamEntries = Object.entries(feedback.streamPopularity);
  const maxStreamCount = Math.max(...streamEntries.map(([, c]) => c), 1);
  const studentStreamEntries = Object.entries(students.byStream);
  const maxStudentStream = Math.max(...studentStreamEntries.map(([, c]) => c), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-chocolate">Analytics Dashboard</h2>
        <button onClick={fetchAnalytics} className="px-4 py-2 bg-cream text-brown rounded-xl text-sm hover:bg-gold-light/30 transition border border-gold/20">
          Refresh
        </button>
      </div>

      {/* ─── FEEDBACK ANALYTICS ─── */}
      <section>
        <h3 className="text-lg font-semibold text-chocolate mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-coral inline-block" />
          Feedback Analytics
        </h3>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-cream rounded-xl p-5 border border-gold/10">
            <p className="text-sm text-muted mb-1">Average Rating</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-coral">{feedback.avgRating || "—"}</span>
              <span className="text-sm text-muted">/ 10</span>
            </div>
            <p className="text-xs text-muted mt-1">{feedback.totalFeedback} responses</p>
          </div>
          <div className="bg-cream rounded-xl p-5 border border-gold/10">
            <p className="text-sm text-muted mb-1">NPS Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-coral">{feedback.avgNps || "—"}</span>
              <span className="text-sm text-muted">/ 10</span>
            </div>
          </div>
          <div className="bg-cream rounded-xl p-5 border border-gold/10">
            <p className="text-sm text-muted mb-1">Total Feedback</p>
            <span className="text-4xl font-bold text-gold">{feedback.totalFeedback}</span>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-cream rounded-xl p-5 border border-gold/10 mb-6">
          <p className="text-sm font-medium text-chocolate mb-3">Rating Distribution</p>
          <div className="space-y-2">
            {feedback.ratingDistribution.map((count, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-muted w-5 text-right">{i + 1}</span>
                <div className="flex-1 bg-ivory rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(count / maxRating) * 100}%`,
                      backgroundColor: i < 4 ? "#E07A5F" : i < 7 ? "#C5973E" : "#059669",
                    }}
                  />
                </div>
                <span className="text-xs text-body w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Words + Stream Popularity side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Words */}
          <div className="bg-cream rounded-xl p-5 border border-gold/10">
            <p className="text-sm font-medium text-chocolate mb-3">Most Useful — Top Words</p>
            {feedback.topWords.length === 0 ? (
              <p className="text-sm text-muted italic">No data yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {feedback.topWords.map((word, i) => (
                  <span
                    key={word}
                    className="px-3 py-1 rounded-full text-sm border"
                    style={{
                      backgroundColor: i < 3 ? "rgba(197,151,62,0.15)" : "rgba(197,151,62,0.07)",
                      borderColor: i < 3 ? "rgba(197,151,62,0.3)" : "rgba(197,151,62,0.12)",
                      color: "#5C3D28",
                      fontWeight: i < 3 ? 600 : 400,
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stream Popularity */}
          <div className="bg-cream rounded-xl p-5 border border-gold/10">
            <p className="text-sm font-medium text-chocolate mb-3">Career Stream Interest</p>
            {streamEntries.length === 0 ? (
              <p className="text-sm text-muted italic">No data yet</p>
            ) : (
              <div className="space-y-2">
                {streamEntries.map(([stream, count]) => (
                  <div key={stream} className="flex items-center gap-3">
                    <span className="text-xs text-body w-24 truncate" title={stream}>{stream}</span>
                    <div className="flex-1 bg-ivory rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full transition-all duration-500"
                        style={{ width: `${(count / maxStreamCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── STUDENT ANALYTICS ─── */}
      <section>
        <h3 className="text-lg font-semibold text-chocolate mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold inline-block" />
          Student Analytics
        </h3>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-cream rounded-xl p-5 border border-gold/10">
            <p className="text-sm text-muted mb-1">Total Counselled</p>
            <span className="text-3xl font-bold text-coral">{students.totalCounselled}</span>
          </div>
          <div className="bg-cream rounded-xl p-5 border border-gold/10">
            <p className="text-sm text-muted mb-1">Show-up Rate</p>
            <span className="text-3xl font-bold text-gold">{students.showUpRate}%</span>
            <p className="text-xs text-muted mt-1">{students.totalCounselled} of {students.totalBooked} booked</p>
          </div>
          <div className="bg-cream rounded-xl p-5 border border-gold/10">
            <p className="text-sm text-muted mb-1">ARC-T Students</p>
            <span className="text-3xl font-bold text-chocolate">{students.arctCount}</span>
          </div>
          <div className="bg-cream rounded-xl p-5 border border-gold/10">
            <p className="text-sm text-muted mb-1">Guests</p>
            <span className="text-3xl font-bold text-brown">{students.guestCount}</span>
          </div>
        </div>

        {/* Guest vs ARC-T ratio bar */}
        {(students.arctCount + students.guestCount > 0) && (
          <div className="bg-cream rounded-xl p-5 border border-gold/10 mb-6">
            <p className="text-sm font-medium text-chocolate mb-3">Guest vs ARC-T Ratio</p>
            <div className="flex rounded-full h-6 overflow-hidden bg-ivory">
              <div
                className="bg-gold h-full flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(students.arctCount / (students.arctCount + students.guestCount)) * 100}%` }}
              >
                {students.arctCount > 0 && `ARC-T ${Math.round((students.arctCount / (students.arctCount + students.guestCount)) * 100)}%`}
              </div>
              <div
                className="bg-coral h-full flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(students.guestCount / (students.arctCount + students.guestCount)) * 100}%` }}
              >
                {students.guestCount > 0 && `Guest ${Math.round((students.guestCount / (students.arctCount + students.guestCount)) * 100)}%`}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* By Institution */}
          <div className="bg-cream rounded-xl p-5 border border-gold/10">
            <p className="text-sm font-medium text-chocolate mb-3">Top 10 Institutions</p>
            {students.byInstitution.length === 0 ? (
              <p className="text-sm text-muted italic">No session data yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/10">
                    <th className="text-left py-2 text-muted font-medium">#</th>
                    <th className="text-left py-2 text-muted font-medium">Institution</th>
                    <th className="text-right py-2 text-muted font-medium">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {students.byInstitution.map((inst, i) => (
                    <tr key={inst.name} className="border-b border-gold/5">
                      <td className="py-2 text-muted">{i + 1}</td>
                      <td className="py-2 text-body truncate max-w-[200px]" title={inst.name}>{inst.name}</td>
                      <td className="py-2 text-right font-medium text-chocolate">{inst.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* By Stream */}
          <div className="bg-cream rounded-xl p-5 border border-gold/10">
            <p className="text-sm font-medium text-chocolate mb-3">By Stream</p>
            {studentStreamEntries.length === 0 ? (
              <p className="text-sm text-muted italic">No stream data yet</p>
            ) : (
              <div className="space-y-2">
                {studentStreamEntries.map(([stream, count]) => (
                  <div key={stream} className="flex items-center gap-3">
                    <span className="text-xs text-body w-24 truncate" title={stream}>{stream}</span>
                    <div className="flex-1 bg-ivory rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-coral rounded-full transition-all duration-500"
                        style={{ width: `${(count / maxStudentStream) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── COUNSELLOR PERFORMANCE ─── */}
      <section>
        <h3 className="text-lg font-semibold text-chocolate mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-zone-green inline-block" />
          Counsellor Performance
        </h3>

        <div className="bg-cream rounded-xl border border-gold/10 overflow-hidden">
          {counsellors.length === 0 ? (
            <p className="text-sm text-muted italic p-5">No counsellor data yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gold/5 border-b border-gold/10">
                    <th className="text-left py-3 px-4 text-muted font-medium">Counsellor</th>
                    <th className="text-right py-3 px-4 text-muted font-medium">Sessions</th>
                    <th className="text-right py-3 px-4 text-muted font-medium">Avg Rating</th>
                    <th className="text-right py-3 px-4 text-muted font-medium">Avg NPS</th>
                  </tr>
                </thead>
                <tbody>
                  {counsellors.map((c) => {
                    const isBelowThreshold = c.avgRating > 0 && c.avgRating < 7;
                    return (
                      <tr
                        key={c.name}
                        className={`border-b border-gold/5 ${isBelowThreshold ? "bg-red-50" : ""}`}
                      >
                        <td className={`py-3 px-4 font-medium ${isBelowThreshold ? "text-red-700" : "text-chocolate"}`}>
                          {c.name}
                          {isBelowThreshold && (
                            <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Below 7</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-body">{c.sessions}</td>
                        <td className={`py-3 px-4 text-right font-semibold ${isBelowThreshold ? "text-red-600" : "text-gold-dark"}`}>
                          {c.avgRating || "—"}
                        </td>
                        <td className="py-3 px-4 text-right text-body">{c.avgNps || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
