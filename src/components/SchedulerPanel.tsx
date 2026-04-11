"use client";

import { useState, useEffect, useCallback } from "react";

type Schedule = {
  id: number;
  schedule_date: string;
  shift_time: string;
  counsellor_name: string;
  cabin_id: string;
  max_students: number;
  booked_count: number;
};

type Counsellor = {
  id: number;
  name: string;
  cabin_id: string;
};

const CABINS = ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8"];
const SHIFTS = ["Morning (9-12)", "Afternoon (12-3)", "Evening (3-6)"];

export function SchedulerPanel() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    counsellor_name: "",
    cabin_id: "C1",
    shift_time: SHIFTS[0],
    max_students: 8,
  });
  const [saving, setSaving] = useState(false);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split("-").map(Number);
      const start = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const end = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

      const res = await fetch(`/api/admin/schedules?start=${start}&end=${end}`);
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules);
        setCounsellors(data.counsellors);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [selectedMonth]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Build calendar
  const [year, month] = selectedMonth.split("-").map(Number);
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  // Get schedules for a date
  const getDateSchedules = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return schedules.filter((s) => s.schedule_date?.startsWith(dateStr));
  };

  const isBlocked = (day: number) => {
    return getDateSchedules(day).some((s) => s.counsellor_name === "BLOCKED");
  };

  const selectedDateStr = selectedDate
    ? `${year}-${String(month).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`
    : null;

  const selectedSchedules = selectedDate ? getDateSchedules(Number(selectedDate)) : [];

  const handleAssign = async () => {
    if (!selectedDateStr || !assignForm.counsellor_name) return;
    setSaving(true);
    try {
      await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedule_date: selectedDateStr,
          shift_time: assignForm.shift_time,
          counsellor_name: assignForm.counsellor_name,
          cabin_id: assignForm.cabin_id,
          max_students: assignForm.max_students,
        }),
      });
      setShowAssignModal(false);
      setAssignForm({ counsellor_name: "", cabin_id: "C1", shift_time: SHIFTS[0], max_students: 8 });
      fetchSchedules();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleBlockDate = async () => {
    if (!selectedDateStr) return;
    setSaving(true);
    try {
      for (const shift of SHIFTS) {
        await fetch("/api/admin/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            schedule_date: selectedDateStr,
            shift_time: shift,
            is_blocked: true,
          }),
        });
      }
      fetchSchedules();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this schedule entry?")) return;
    await fetch(`/api/admin/schedules?id=${id}`, { method: "DELETE" });
    fetchSchedules();
  };

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    const d = new Date(year, month, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    setSelectedDate(null);
  };

  const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between rounded-xl border border-gold/20 bg-white px-6 py-3">
        <button onClick={prevMonth} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-cream">
          Previous
        </button>
        <h2 className="text-lg font-semibold text-chocolate">{monthName}</h2>
        <button onClick={nextMonth} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-cream">
          Next
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Calendar */}
        <div className="md:col-span-2 rounded-xl border border-gold/20 bg-white p-4">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted">Loading calendar...</div>
          ) : (
            <>
              {/* Day headers */}
              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (day === null) return <div key={`e-${i}`} />;
                  const daySchedules = getDateSchedules(day);
                  const blocked = isBlocked(day);
                  const bookedTotal = daySchedules.reduce((sum, s) => sum + (s.booked_count || 0), 0);
                  const capacityTotal = daySchedules.reduce((sum, s) => sum + (s.max_students || 0), 0);
                  const isSelected = selectedDate === String(day);
                  const hasSchedules = daySchedules.length > 0;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(String(day))}
                      className={`relative rounded-lg p-2 text-left text-sm transition-colors ${
                        blocked
                          ? "bg-red-50 text-red-400 border border-red-200"
                          : isSelected
                          ? "bg-coral text-white border border-coral"
                          : hasSchedules
                          ? "bg-green-50 border border-green-200 hover:bg-green-100"
                          : "border border-gray-100 hover:bg-ivory"
                      }`}
                    >
                      <span className="font-medium">{day}</span>
                      {hasSchedules && !blocked && (
                        <div className="mt-0.5 text-[9px] leading-tight">
                          <span className={isSelected ? "text-white/80" : "text-green-700"}>
                            {daySchedules.filter((s) => s.counsellor_name !== "BLOCKED").length} slots
                          </span>
                          {capacityTotal > 0 && (
                            <span className={`block ${isSelected ? "text-white/60" : "text-muted"}`}>
                              {bookedTotal}/{capacityTotal}
                            </span>
                          )}
                        </div>
                      )}
                      {blocked && (
                        <div className="mt-0.5 text-[9px] text-red-400">Holiday</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Day Detail Panel */}
        <div className="rounded-xl border border-gold/20 bg-white p-4">
          {!selectedDate ? (
            <div className="py-12 text-center text-sm text-muted">
              Select a date to view/edit schedule
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-chocolate">
                  {new Date(year, month - 1, Number(selectedDate)).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="rounded-lg bg-coral px-3 py-1.5 text-xs font-medium text-white hover:bg-coral-dark"
                  >
                    + Assign
                  </button>
                  <button
                    onClick={handleBlockDate}
                    disabled={saving}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Block
                  </button>
                </div>
              </div>

              {/* Booked vs Capacity summary */}
              {selectedSchedules.length > 0 && (
                <div className="mb-3 rounded-lg bg-ivory/50 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Total Capacity</span>
                    <span className="font-semibold text-chocolate">
                      {selectedSchedules.reduce((s, e) => s + (e.booked_count || 0), 0)} booked /{" "}
                      {selectedSchedules.reduce((s, e) => s + (e.max_students || 0), 0)} max
                    </span>
                  </div>
                </div>
              )}

              {/* Schedule entries */}
              <div className="space-y-2">
                {selectedSchedules.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted">No schedule entries for this date</p>
                ) : (
                  selectedSchedules
                    .filter((s) => s.counsellor_name !== "BLOCKED")
                    .map((s) => (
                      <div key={s.id} className="rounded-lg border border-gold/10 bg-ivory/30 p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-chocolate">{s.counsellor_name}</p>
                            <p className="text-xs text-muted">
                              {s.shift_time} &middot; Cabin {s.cabin_id || "TBD"}
                            </p>
                            <p className="mt-1 text-xs text-muted">
                              {s.booked_count || 0}/{s.max_students} students
                            </p>
                          </div>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Cabin occupancy grid */}
              {selectedSchedules.length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 text-xs font-semibold text-chocolate">Cabin Assignments</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {CABINS.map((cabin) => {
                      const assigned = selectedSchedules.filter((s) => s.cabin_id === cabin && s.counsellor_name !== "BLOCKED");
                      return (
                        <div
                          key={cabin}
                          className={`rounded-lg border p-2 text-center text-xs ${
                            assigned.length > 0
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-gray-200 bg-gray-50 text-muted"
                          }`}
                        >
                          <span className="font-semibold">{cabin}</span>
                          {assigned.length > 0 && (
                            <p className="mt-0.5 truncate text-[10px]">{assigned[0].counsellor_name.split(" ")[0]}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-xl border border-gold/20 bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-chocolate">Assign Counsellor</h3>
            <p className="mb-4 text-xs text-muted">
              Date: {selectedDateStr}
            </p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-chocolate">Counsellor</label>
                <select
                  value={assignForm.counsellor_name}
                  onChange={(e) => setAssignForm({ ...assignForm, counsellor_name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gold"
                >
                  <option value="">Select counsellor...</option>
                  {counsellors.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-chocolate">Shift</label>
                <select
                  value={assignForm.shift_time}
                  onChange={(e) => setAssignForm({ ...assignForm, shift_time: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gold"
                >
                  {SHIFTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-chocolate">Cabin</label>
                <select
                  value={assignForm.cabin_id}
                  onChange={(e) => setAssignForm({ ...assignForm, cabin_id: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gold"
                >
                  {CABINS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-chocolate">Max Students</label>
                <input
                  type="number"
                  value={assignForm.max_students}
                  onChange={(e) => setAssignForm({ ...assignForm, max_students: parseInt(e.target.value) || 8 })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gold"
                  min={1}
                  max={20}
                />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleAssign}
                disabled={saving || !assignForm.counsellor_name}
                className="flex-1 rounded-lg bg-coral py-2.5 text-sm font-medium text-white hover:bg-coral-dark disabled:opacity-40"
              >
                {saving ? "Saving..." : "Assign"}
              </button>
              <button
                onClick={() => setShowAssignModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-brown hover:bg-cream"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
