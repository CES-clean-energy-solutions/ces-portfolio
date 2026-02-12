import type { Metadata } from "next";
import { inter } from "./fonts";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  title: "Services portfolio - ces",
  description:
    "Engineering consultancy for energy, environment, and sustainable urban development",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          rel="preload"
          as="video"
          href="/video/hero-bg.webm"
          type="video/webm"
        />
      </head>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
