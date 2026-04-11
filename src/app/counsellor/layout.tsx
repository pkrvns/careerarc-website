import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Counsellor Portal | CareerArc",
  robots: { index: false, follow: false },
};

export default function CounsellorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
