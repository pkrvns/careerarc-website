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

type Stats = { total: number; day1: number; day2: number };

export function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<"students" | "guests">("students");
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

  useEffect(() => {
    if (!loggedIn) return;
    fetchRegistrations();
    fetchGuests();
  }, [loggedIn, fetchRegistrations, fetchGuests]);

  const saveEdit = async (id: number) => {
    await fetch("/api/admin/registrations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editData }),
    });
    setEditing(null);
    fetchRegistrations();
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
