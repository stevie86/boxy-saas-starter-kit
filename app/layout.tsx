import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HostelPulse",
  description: "Lean foundation on Next.js 15",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="corporate">
      <body>{children}</body>
    </html>
  );
}
