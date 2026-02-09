import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CES Clean Energy Solutions",
  description: "Engineering consultancy for energy, environment, and sustainable urban development",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}