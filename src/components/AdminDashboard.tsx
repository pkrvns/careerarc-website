"use client";

import { useState, useEffect, useCallback } from "react";

type Registration = {
  id: number;
  full_name: string;
  mobile: string;
  institution: string;
  class_year: string;
  preferred_date: string;
  parent_attending: boolean;
  parent_name: string | null;
  registered_at: string;
};

type Guest = {
  id: number;
  guest_name: string;
  guest_mobile: string;
  relationship: string;
  student_mobile: string;
  student_name: string | null;
  preferred_date: string;
  registered_at: string;
};

type ArctParticipant = {
  id: number;
  name: string;
  father_name: string;
  institution: string;
  mobile: string;
  arct_roll: string;
  status: string;
  imported_at: string;
};

type ArctStats = { total: number; complete: number; pending: number };

type Stats = { total: number; day1: number; day2: number };

export function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<"students" | "guests" | "arct">("students");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, day1: 0, day2: 0 });
  const [guestStats, setGuestStats] = useState<Stats & { day1Limit: number; day2Limit: number }>({
    total: 0, day1: 0, day2: 0, day1Limit: 200, day2Limit: 200,
  });
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Registration>>({});
  const [loading, setLoading] = useState(false);
  const [arctParticipants, setArctParticipants] = useState<ArctParticipant[]>([]);
  const [arctStats, setArctStats] = useState<ArctStats>({ total: 0, complete: 0, pending: 0 });
  const [arctPage, setArctPage] = useState(1);
  const [arctTotalPages, setArctTotalPages] = useState(0);
  const [arctSearch, setArctSearch] = useState("");
  const [arctStatusFilter, setArctStatusFilter] = useState("");
  const [arctInstFilter, setArctInstFilter] = useState("");
  const [arctInstitutions, setArctInstitutions] = useState<string[]>([]);
  const [arctEditing, setArctEditing] = useState<number | null>(null);
  const [arctEditData, setArctEditData] = useState<Partial<ArctParticipant>>({});
  const [arctLoading, setArctLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState("");

  const login = async () => {
    setLoginError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setLoggedIn(true);
    } else {
      setLoginError(data.error || "Login failed");
    }
  };

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (dateFilter) params.set("date", dateFilter);
    const res = await fetch(`/api/admin/registrations?${params}`);
    if (res.ok) {
      const data = await res.json();
      setRegistrations(data.registrations);
      setStats(data.stats);
    }
    setLoading(false);
  }, [search, dateFilter]);

  const fetchGuests = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (dateFilter) params.set("date", dateFilter);
    const res = await fetch(`/api/admin/guests?${params}`);
    if (res.ok) {
      const data = await res.json();
      setGuests(data.guests);
      setGuestStats(data.stats);
    }
  }, [search, dateFilter]);

  const fetchArctParticipants = useCallback(async (page = 1) => {
    setArctLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "50");
      if (arctSearch) params.set("search", arctSearch);
      if (arctStatusFilter) params.set("status", arctStatusFilter);
      if (arctInstFilter) params.set("institution", arctInstFilter);
      const res = await fetch(`/api/admin/arct-participants?${params}`);
      if (res.ok) {
        const data = await res.json();
        setArctParticipants(data.participants);
        setArctStats(data.stats);
        setArctPage(data.page);
        setArctTotalPages(data.totalPages);
        if (data.institutions?.length) setArctInstitutions(data.institutions);
      }
    } catch { /* ignore */ }
    setArctLoading(false);
  }, [arctSearch, arctStatusFilter, arctInstFilter]);

  useEffect(() => {
    if (!loggedIn) return;
    fetchRegistrations();
    fetchGuests();
    fetchArctParticipants();
  }, [loggedIn, fetchRegistrations, fetchGuests, fetchArctParticipants]);

  const saveEdit = async (id: number) => {
    await fetch("/api/admin/registrations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editData }),
    });
    setEditing(null);
    fetchRegistrations();
  };

  const saveArctEdit = async (id: number) => {
    await fetch("/api/admin/arct-participants", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...arctEditData }),
    });
    setArctEditing(null);
    fetchArctParticipants(arctPage);
  };

  const deleteArctParticipant = async (id: number) => {
    if (!confirm("Delete this ARC-T participant?")) return;
    await fetch(`/api/admin/arct-participants?id=${id}`, { method: "DELETE" });
    fetchArctParticipants(arctPage);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult("");
    try {
      const text = await file.text();
      const participants = JSON.parse(text);
      // Import in batches of 200
      let totalImported = 0;
      let totalSkipped = 0;
      for (let i = 0; i < participants.length; i += 200) {
        const batch = participants.slice(i, i + 200);
        const res = await fetch("/api/admin/import-participants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participants: batch }),
        });
        if (res.ok) {
          const data = await res.json();
          totalImported += data.imported;
          totalSkipped += data.skipped;
        }
      }
      setImportResult(`Imported ${totalImported} participants (${totalSkipped} skipped/duplicates)`);
      fetchArctParticipants();
    } catch {
      setImportResult("Error importing file. Make sure it's a valid JSON file.");
    } finally {
      setImporting(false);
    }
  };

  const deleteRegistration = async (id: number, type: "student" | "guest") => {
    if (!confirm("Are you sure you want to delete this registration?")) return;
    const endpoint = type === "student" ? "/api/admin/registrations" : "/api/admin/guests";
    await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
    if (type === "student") fetchRegistrations();
    else fetchGuests();
  };

  // Login Screen
  if (!loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory px-4">
        <div className="w-full max-w-sm rounded-xl border border-gold/20 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-center text-xl font-semibold text-chocolate">
            Admin Login
          </h1>
          {loginError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {loginError}
            </div>
          )}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-3 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
          <button
            onClick={login}
            className="w-full rounded-lg bg-coral py-2.5 text-sm font-medium text-white transition-colors hover:bg-coral-dark"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-ivory px-4 pt-20 pb-10">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-chocolate">
            Admin Dashboard
          </h1>
          <button
            onClick={() => { setLoggedIn(false); document.cookie = "admin_token=; Max-Age=0; path=/"; }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-brown hover:bg-cream"
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-gold/20 bg-white p-4">
            <div className="text-2xl font-semibold text-chocolate">{stats.total}</div>
            <div className="text-xs text-muted">Total Students</div>
          </div>
          <div className="rounded-xl border border-gold/20 bg-white p-4">
            <div className="text-2xl font-semibold text-chocolate">{stats.day1}</div>
            <div className="text-xs text-muted">Day 1 (25 Apr)</div>
          </div>
          <div className="rounded-xl border border-gold/20 bg-white p-4">
            <div className="text-2xl font-semibold text-chocolate">{stats.day2}</div>
            <div className="text-xs text-muted">Day 2 (26 Apr)</div>
          </div>
          <div className="rounded-xl border border-gold/20 bg-white p-4">
            <div className="text-2xl font-semibold text-chocolate">{guestStats.total}</div>
            <div className="text-xs text-muted">Total Guests ({guestStats.day1}/{guestStats.day1Limit} D1, {guestStats.day2}/{guestStats.day2Limit} D2)</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setTab("students")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === "students" ? "bg-coral text-white" : "bg-white text-brown border border-gold/20"
            }`}
          >
            Students ({stats.total})
          </button>
          <button
            onClick={() => setTab("guests")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === "guests" ? "bg-coral text-white" : "bg-white text-brown border border-gold/20"
            }`}
          >
            Guests ({guestStats.total})
          </button>
          <button
            onClick={() => setTab("arct")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === "arct" ? "bg-coral text-white" : "bg-white text-brown border border-gold/20"
            }`}
          >
            ARC-T Data ({arctStats.total})
          </button>
        </div>

        {/* Search + Filter */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchRegistrations();
                fetchGuests();
              }
            }}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gold"
          >
            <option value="">All Dates</option>
            <option value="day1">Day 1 (25 Apr)</option>
            <option value="day2">Day 2 (26 Apr)</option>
          </select>
          <button
            onClick={() => { fetchRegistrations(); fetchGuests(); }}
            className="rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-white hover:bg-gold-dark"
          >
            Search
          </button>
        </div>

        {/* Students Table */}
        {tab === "students" && (
          <div className="overflow-x-auto rounded-xl border border-gold/20 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gold/10 bg-cream">
                <tr>
                  <th className="px-4 py-3 font-medium text-chocolate">#</th>
                  <th className="px-4 py-3 font-medium text-chocolate">Name</th>
                  <th className="px-4 py-3 font-medium text-chocolate">Mobile</th>
                  <th className="px-4 py-3 font-medium text-chocolate">Institution</th>
                  <th className="px-4 py-3 font-medium text-chocolate">Class</th>
                  <th className="px-4 py-3 font-medium text-chocolate">Date</th>
                  <th className="px-4 py-3 font-medium text-chocolate">Parent</th>
                  <th className="px-4 py-3 font-medium text-chocolate">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted">Loading...</td></tr>
                ) : registrations.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted">No registrations found</td></tr>
                ) : (
                  registrations.map((r, i) => (
                    <tr key={r.id} className="border-b border-gold/5 hover:bg-ivory/50">
                      <td className="px-4 py-3 text-muted">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-chocolate">
                        {editing === r.id ? (
                          <input
                            value={editData.full_name ?? r.full_name}
                            onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                            className="w-full rounded border px-2 py-1 text-sm"
                          />
                        ) : r.full_name}
                      </td>
                      <td className="px-4 py-3">{r.mobile}</td>
                      <td className="px-4 py-3 text-xs">
                        {editing === r.id ? (
                          <input
                            value={editData.institution ?? r.institution}
                            onChange={(e) => setEditData({ ...editData, institution: e.target.value })}
                            className="w-full rounded border px-2 py-1 text-sm"
                          />
                        ) : r.institution}
                      </td>
                      <td className="px-4 py-3">{r.class_year}</td>
                      <td className="px-4 py-3">
                        {editing === r.id ? (
                          <select
                            value={editData.preferred_date ?? r.preferred_date}
                            onChange={(e) => setEditData({ ...editData, preferred_date: e.target.value })}
                            className="rounded border px-2 py-1 text-sm"
                          >
                            <option value="day1">Day 1</option>
                            <option value="day2">Day 2</option>
                          </select>
                        ) : (
                          <span className={`rounded-full px-2 py-0.5 text-xs ${r.preferred_date === "day1" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>
                            {r.preferred_date === "day1" ? "Day 1" : "Day 2"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {r.parent_attending ? `Yes — ${r.parent_name || ""}` : "No"}
                      </td>
                      <td className="px-4 py-3">
                        {editing === r.id ? (
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(r.id)} className="text-xs text-green-600 hover:underline">Save</button>
                            <button onClick={() => setEditing(null)} className="text-xs text-muted hover:underline">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditing(r.id); setEditData({ full_name: r.full_name, institution: r.institution, preferred_date: r.preferred_date }); }}
                              className="text-xs text-gold hover:underline"
                            >
                              Edit
                            </button>
                            <button onClick={() => deleteRegistration(r.id, "student")} className="text-xs text-red-500 hover:underline">
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ARC-T Participants */}
        {tab === "arct" && (
          <div>
            {/* ARC-T Stats Cards */}
            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-gold/20 bg-white p-4">
                <div className="text-2xl font-semibold text-chocolate">{arctStats.total}</div>
                <div className="text-xs text-muted">Total Participants</div>
              </div>
              <div className="rounded-xl border border-gold/20 bg-white p-4">
                <div className="text-2xl font-semibold text-green-600">{arctStats.complete}</div>
                <div className="text-xs text-muted">Completed Test</div>
              </div>
              <div className="rounded-xl border border-gold/20 bg-white p-4">
                <div className="text-2xl font-semibold text-amber-600">{arctStats.pending}</div>
                <div className="text-xs text-muted">Pending (No Test)</div>
              </div>
              <div className="rounded-xl border border-gold/20 bg-white p-4">
                <label className="cursor-pointer rounded-lg bg-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold-dark">
                  {importing ? "Importing..." : "Import JSON"}
                  <input type="file" accept=".json" onChange={handleImportFile} disabled={importing} className="hidden" />
                </label>
                {importResult && <div className="mt-1 text-xs text-green-600">{importResult}</div>}
              </div>
            </div>

            {/* ARC-T Search + Filters */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Search name, mobile, roll no..."
                value={arctSearch}
                onChange={(e) => setArctSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setArctPage(1); fetchArctParticipants(1); } }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gold"
              />
              <select
                value={arctStatusFilter}
                onChange={(e) => { setArctStatusFilter(e.target.value); setArctPage(1); }}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gold"
              >
                <option value="">All Status</option>
                <option value="complete">Complete</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={arctInstFilter}
                onChange={(e) => { setArctInstFilter(e.target.value); setArctPage(1); }}
                className="max-w-[250px] rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gold"
              >
                <option value="">All Institutions</option>
                {arctInstitutions.map((inst) => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
              <button
                onClick={() => { setArctPage(1); fetchArctParticipants(1); }}
                className="rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-white hover:bg-gold-dark"
              >
                Search
              </button>
            </div>

            {/* ARC-T Table */}
            <div className="overflow-x-auto rounded-xl border border-gold/20 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gold/10 bg-cream">
                  <tr>
                    <th className="px-3 py-3 font-medium text-chocolate">#</th>
                    <th className="px-3 py-3 font-medium text-chocolate">Roll No</th>
                    <th className="px-3 py-3 font-medium text-chocolate">Name</th>
                    <th className="px-3 py-3 font-medium text-chocolate">Father&apos;s Name</th>
                    <th className="px-3 py-3 font-medium text-chocolate">Mobile</th>
                    <th className="px-3 py-3 font-medium text-chocolate">Institution</th>
                    <th className="px-3 py-3 font-medium text-chocolate">Status</th>
                    <th className="px-3 py-3 font-medium text-chocolate">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {arctLoading ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-muted">Loading...</td></tr>
                  ) : arctParticipants.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-muted">No participants found</td></tr>
                  ) : (
                    arctParticipants.map((p, i) => (
                      <tr key={p.id} className="border-b border-gold/5 hover:bg-ivory/50">
                        <td className="px-3 py-2.5 text-muted">{(arctPage - 1) * 50 + i + 1}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-chocolate">{p.arct_roll}</td>
                        <td className="px-3 py-2.5 font-medium text-chocolate">
                          {arctEditing === p.id ? (
                            <input value={arctEditData.name ?? p.name} onChange={(e) => setArctEditData({ ...arctEditData, name: e.target.value })} className="w-full rounded border px-2 py-1 text-sm" />
                          ) : p.name}
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {arctEditing === p.id ? (
                            <input value={arctEditData.father_name ?? p.father_name} onChange={(e) => setArctEditData({ ...arctEditData, father_name: e.target.value })} className="w-full rounded border px-2 py-1 text-sm" />
                          ) : p.father_name}
                        </td>
                        <td className="px-3 py-2.5">
                          {arctEditing === p.id ? (
                            <input value={arctEditData.mobile ?? p.mobile} onChange={(e) => setArctEditData({ ...arctEditData, mobile: e.target.value })} className="w-28 rounded border px-2 py-1 text-sm" />
                          ) : p.mobile}
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {arctEditing === p.id ? (
                            <input value={arctEditData.institution ?? p.institution} onChange={(e) => setArctEditData({ ...arctEditData, institution: e.target.value })} className="w-full rounded border px-2 py-1 text-sm" />
                          ) : p.institution}
                        </td>
                        <td className="px-3 py-2.5">
                          {arctEditing === p.id ? (
                            <select value={arctEditData.status ?? p.status} onChange={(e) => setArctEditData({ ...arctEditData, status: e.target.value })} className="rounded border px-2 py-1 text-sm">
                              <option value="complete">Complete</option>
                              <option value="pending">Pending</option>
                            </select>
                          ) : (
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status?.toLowerCase() === "complete" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                              {p.status?.toLowerCase() === "complete" ? "Complete" : "Pending"}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          {arctEditing === p.id ? (
                            <div className="flex gap-2">
                              <button onClick={() => saveArctEdit(p.id)} className="text-xs text-green-600 hover:underline">Save</button>
                              <button onClick={() => setArctEditing(null)} className="text-xs text-muted hover:underline">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setArctEditing(p.id); setArctEditData({ name: p.name, father_name: p.father_name, institution: p.institution, mobile: p.mobile, status: p.status }); }}
                                className="text-xs text-gold hover:underline"
                              >Edit</button>
                              <button onClick={() => deleteArctParticipant(p.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {arctTotalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted">
                  Page {arctPage} of {arctTotalPages} ({arctStats.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { const p = Math.max(1, arctPage - 1); setArctPage(p); fetchArctParticipants(p); }}
                    disabled={arctPage <= 1}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-cream"
                  >
                    Previous
                  </button>
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, arctTotalPages) }, (_, i) => {
                    let pageNum: number;
                    if (arctTotalPages <= 5) {
                      pageNum = i + 1;
                    } else if (arctPage <= 3) {
                      pageNum = i + 1;
                    } else if (arctPage >= arctTotalPages - 2) {
                      pageNum = arctTotalPages - 4 + i;
                    } else {
                      pageNum = arctPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => { setArctPage(pageNum); fetchArctParticipants(pageNum); }}
                        className={`rounded-lg px-3 py-1.5 text-sm ${pageNum === arctPage ? "bg-coral text-white" : "border border-gray-300 hover:bg-cream"}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => { const p = Math.min(arctTotalPages, arctPage + 1); setArctPage(p); fetchArctParticipants(p); }}
                    disabled={arctPage >= arctTotalPages}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-cream"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Guests Table */}
        {tab === "guests" && (
          <div className="overflow-x-auto rounded-xl border border-gold/20 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gold/10 bg-cream">
                <tr>
                  <th className="px-4 py-3 font-medium text-chocolate">#</th>
                  <th className="px-4 py-3 font-medium text-chocolate">Guest Name</th>
                  <th className="px-4 py-3 font-medium text-chocolate">Mobile</th>
                  <th className="px-4 py-3 font-medium text-chocolate">Relationship</th>
                  <th className="px-4 py-3 font-medium text-chocolate">Student</th>
                  <th className="px-4 py-3 font-medium text-chocolate">Student Mobile</th>
                  <th className="px-4 py-3 font-medium text-chocolate">Date</th>
                  <th className="px-4 py-3 font-medium text-chocolate">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted">No guest registrations found</td></tr>
                ) : (
                  guests.map((g, i) => (
                    <tr key={g.id} className="border-b border-gold/5 hover:bg-ivory/50">
                      <td className="px-4 py-3 text-muted">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-chocolate">{g.guest_name}</td>
                      <td className="px-4 py-3">{g.guest_mobile}</td>
                      <td className="px-4 py-3">{g.relationship}</td>
                      <td className="px-4 py-3">{g.student_name || "—"}</td>
                      <td className="px-4 py-3">{g.student_mobile}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${g.preferred_date === "day1" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>
                          {g.preferred_date === "day1" ? "Day 1" : "Day 2"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteRegistration(g.id, "guest")} className="text-xs text-red-500 hover:underline">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
