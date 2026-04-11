import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CareerArc Live Dashboard",
  description: "Real-time event tracking dashboard for CareerArc counselling sessions",
};

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white overflow-hidden">
      {children}
    </div>
  );
}
