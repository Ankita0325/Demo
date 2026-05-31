import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "../components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: "Damusia | Validate Startup Ideas Instantly",
  description:
    "Measure real market interest before you build. Damusia helps founders, builders, and teams test product-market fit using analytics and waitlists.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Damusia | Validate Startup Ideas Instantly",
    description:
      "Measure real market interest before you build. Test product-market fit with analytics, feedback loops, and instant waitlists.",
    images: [{ url: "/og-image.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-gray-100 selection:bg-purple-500/30 selection:text-white">
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
