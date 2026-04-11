import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Volunteer App | CareerArc",
  robots: { index: false, follow: false },
};

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
