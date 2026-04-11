"use client";

import { useState, useEffect, useCallback } from "react";

type Certificate = {
  id: number;
  student_id: number;
  cert_type: string;
  status: string;
  student_name: string;
  student_phone: string;
  institution: string;
  created_at: string;
};

type CertStats = {
  total: number;
  generated: number;
  sent: number;
  byType: Record<string, number>;
};

const CERT_TYPES = [
  { value: "arct_counselling", label: "ARC-T Counselling", desc: "For students who completed counselling" },
  { value: "guest", label: "Guest Certificate", desc: "For guest/parent attendees" },
  { value: "merit", label: "Merit Certificate", desc: "For top-performing students" },
  { value: "teacher", label: "Teacher Certificate", desc: "For participating teachers" },
  { value: "counsellor", label: "Counsellor Certificate", desc: "For faculty counsellors" },
  { value: "volunteer", label: "Volunteer Certificate", desc: "For event volunteers" },
];

export function CertificatesPanel() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<CertStats>({ total: 0, generated: 0, sent: 0, byType: {} });
  const [typeFilter, setTypeFilter] = useState("");
  const [generating, setGenerating] = useState(false);
  const [batchResult, setBatchResult] = useState("");

  const fetchCertificates = useCallback(async () => {
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    const res = await fetch(`/api/admin/certificates?${params}`);
    if (res.ok) {
      const data = await res.json();
      setCertificates(data.certificates);
      setStats(data.stats);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const generateBatch = async () => {
    setGenerating(true);
    setBatchResult("");
    try {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: true }),
      });
      const data = await res.json();
      setBatchResult(`Generated ${data.generated} certificates for today's completed sessions`);
      fetchCertificates();
    } catch {
      setBatchResult("Error generating certificates");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gold/20 bg-white p-4">
          <div className="text-2xl font-semibold text-chocolate">{stats.total}</div>
          <div className="text-xs text-muted">Total Certificates</div>
        </div>
        <div className="rounded-xl border border-gold/20 bg-white p-4">
          <div className="text-2xl font-semibold text-green-600">{stats.generated}</div>
          <div className="text-xs text-muted">Generated</div>
        </div>
        <div className="rounded-xl border border-gold/20 bg-white p-4">
          <div className="text-2xl font-semibold text-blue-600">{stats.sent}</div>
          <div className="text-xs text-muted">Sent via WhatsApp</div>
        </div>
        <div className="rounded-xl border border-gold/20 bg-white p-4">
          <button
            onClick={generateBatch}
            disabled={generating}
            className="rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral-dark disabled:opacity-50"
          >
            {generating ? "Generating..." : "Batch Generate Today"}
          </button>
          {batchResult && <div className="mt-1 text-xs text-green-600">{batchResult}</div>}
        </div>
      </div>

      {/* Certificate Types Grid */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {CERT_TYPES.map((ct) => (
          <div
            key={ct.value}
            className="rounded-xl border border-gold/20 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-chocolate">{ct.label}</div>
              <div className="text-lg font-bold text-gold">{stats.byType[ct.value] || 0}</div>
            </div>
            <div className="mt-1 text-xs text-muted">{ct.desc}</div>
          </div>
        ))}
      </div>

      {/* Filter + Table */}
      <div className="mb-4 flex gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gold"
        >
          <option value="">All Types</option>
          {CERT_TYPES.map((ct) => (
            <option key={ct.value} value={ct.value}>{ct.label}</option>
          ))}
        </select>
        <button
          onClick={fetchCertificates}
          className="rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-white hover:bg-gold-dark"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gold/20 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gold/10 bg-cream">
            <tr>
              <th className="px-4 py-3 font-medium text-chocolate">#</th>
              <th className="px-4 py-3 font-medium text-chocolate">Student</th>
              <th className="px-4 py-3 font-medium text-chocolate">Phone</th>
              <th className="px-4 py-3 font-medium text-chocolate">Institution</th>
              <th className="px-4 py-3 font-medium text-chocolate">Type</th>
              <th className="px-4 py-3 font-medium text-chocolate">Status</th>
              <th className="px-4 py-3 font-medium text-chocolate">Date</th>
            </tr>
          </thead>
          <tbody>
            {certificates.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">No certificates generated yet</td></tr>
            ) : (
              certificates.map((c, i) => (
                <tr key={c.id} className="border-b border-gold/5 hover:bg-ivory/50">
                  <td className="px-4 py-3 text-muted">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-chocolate">{c.student_name || "—"}</td>
                  <td className="px-4 py-3">{c.student_phone || "—"}</td>
                  <td className="px-4 py-3 text-xs">{c.institution || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                      {c.cert_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.status === "sent" ? "bg-green-50 text-green-700" :
                      c.status === "generated" ? "bg-blue-50 text-blue-700" :
                      "bg-gray-50 text-gray-700"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
