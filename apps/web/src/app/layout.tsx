import type { Metadata } from "next";
import { inter } from "./fonts";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  title: "CES Portfolio — Clean Energy Solutions",
  description:
    "Engineering consultancy for energy, environment, and sustainable urban development. BIM MEP Engineering, Climate Analysis, CFD, Daylight Simulation, Green Finance, Circularity.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "CES Portfolio — Clean Energy Solutions",
    description:
      "Engineering consultancy for energy, environment, and sustainable urban development",
    url: "https://portfolio.ic-ces.engineering",
    siteName: "CES Portfolio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CES Clean Energy Solutions Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CES Portfolio — Clean Energy Solutions",
    description:
      "Engineering consultancy for energy, environment, and sustainable urban development",
    images: ["/og-image.jpg"],
  },
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
