"use client";

import { useEffect, useState } from "react";

export function LiveCounter() {
  const [stats, setStats] = useState({ registered: 0, arctTotal: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/public-stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // Silent fail — counter just won't show
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="border-t border-gold/30 pt-8">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        <div>
          <div className="text-[28px] font-semibold text-chocolate md:text-4xl">
            {stats.arctTotal > 0 ? stats.arctTotal.toLocaleString() : "4,968"}
          </div>
          <div className="text-sm text-muted">Students Tested (ARC-T)</div>
        </div>
        <div>
          <div className="text-[28px] font-semibold text-chocolate md:text-4xl">
            {stats.registered > 0 ? stats.registered.toLocaleString() : "Coming May"}
          </div>
          <div className="text-sm text-muted">
            {stats.registered > 0 ? "Sessions Booked" : "Sessions Open"}
          </div>
        </div>
        <div>
          <div className="text-[28px] font-semibold text-chocolate md:text-4xl">
            80+
          </div>
          <div className="text-sm text-muted">Institutions</div>
        </div>
        <div>
          <div className="text-[28px] font-semibold text-chocolate md:text-4xl">
            10
          </div>
          <div className="text-sm text-muted">Career Streams</div>
        </div>
      </div>
    </div>
  );
}
