"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getInterestCount, logClick } from "../lib/supabase";
import WaitlistModal from "../components/WaitlistModal";

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interestCount, setInterestCount] = useState(428);
  const [visitorId, setVisitorId] = useState("");

  const activeProjectId = "damusia";
  const activeProjectName = "Damusia";

  const refreshCounts = async () => {
    const currentProjCount = await getInterestCount(activeProjectId);
    const timer = setTimeout(() => {
      setInterestCount(currentProjCount);
    }, 0);
    return () => clearTimeout(timer);
  };

  // Initialize in-memory session visitor ID and set theme on mount
  useEffect(() => {
    // Generate temporary in-memory session ID (no localStorage storage)
    const tempVid =
      "session_" +
      Math.random().toString(36).substring(2, 11) +
      "_" +
      Date.now();

    let savedTheme: "dark" | "light" = "dark";
    if (typeof window !== "undefined") {
      // Default to dark mode but check if user set document class previously (non-persistent)
      const isLightClass = document.documentElement.classList.contains("light");
      savedTheme = isLightClass ? "light" : "dark";
    }

    const timer = setTimeout(() => {
      setVisitorId(tempVid);
      setTheme(savedTheme);
      document.documentElement.className = savedTheme;
    }, 0);

    refreshCounts();

    const interval = setInterval(refreshCounts, 20000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Toggle Light/Dark Mode in memory/document class
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.className = nextTheme;
  };

  // Log click and open interest form
  const handleCtaClick = async (ctaLabel: string) => {
    setIsModalOpen(true);
    if (visitorId) {
      console.log(
        `Log click: Project=${activeProjectId}, Session=${visitorId}, CTA=${ctaLabel}`,
      );
      await logClick(visitorId, activeProjectId, true);
    }
  };

  const handleSuccessSubmit = async () => {
    await refreshCounts();
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300 overflow-hidden theme-damusia">
      {/* Background glow orbs that match Damusia color styles */}
      <div className="absolute top-[-25%] left-[-15%] w-[70%] h-[75%] rounded-full radial-glow-primary pointer-events-none z-0" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[75%] rounded-full radial-glow-secondary pointer-events-none z-0" />

      {/* Technical Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-light)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-light)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

      {/* 1. Navbar */}
      <nav className="sticky top-0 z-40 w-full border-b border-light bg-background/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 relative">
              <Image
                src="/logo.png"
                alt="Damusia Logo"
                width={36}
                height={36}
                style={{ height: "auto" }}
                className="object-contain rounded-lg"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              {activeProjectName}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full border border-light bg-card-bg text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
              aria-label="Toggle theme mode"
            >
              {theme === "dark" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={() => handleCtaClick("Navbar CTA Button")}
              className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-foreground hover:opacity-90 text-background font-semibold text-sm transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              I&apos;m Interested
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow z-10">
        {/* 2. Hero Section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 pt-20 pb-20 md:pt-28 md:pb-28 text-center relative">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/20 dark:bg-slate-950/60 light:bg-slate-100 border border-light text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-semibold mb-8 animate-float">
            <span>✨</span>
            <span>Introducing Pre-Launch Access</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-foreground max-w-4xl mx-auto mb-6">
            Validate Your Startup Idea{" "}
            <span className="bg-gradient-to-r from-[rgba(var(--color-primary),1)] via-[rgba(var(--color-secondary),0.8)] to-[rgba(var(--color-primary),0.9)] bg-clip-text text-transparent">
              Before Building It
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 dark:text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
            Stop wasting months coding features nobody wants. Measure real
            market interest, log demand analytics, and secure pre-launch
            indications in minutes.
          </p>

          {/* Social Proof Counter */}
          <div className="flex items-center justify-center gap-2 mb-8 text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 bg-slate-200/20 dark:bg-slate-950/30 border border-light py-2 px-5 rounded-full w-fit mx-auto animate-pulse-subtle">
            <span>🔥</span>
            <span>{interestCount} people already interested</span>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={() => handleCtaClick("Hero Primary Button")}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[rgba(var(--color-primary),1)] to-[rgba(var(--color-secondary),1)] hover:opacity-95 text-white font-bold text-base transition-all duration-300 shadow-lg shadow-purple-500/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Get Early Access
            </button>

            <button
              onClick={() => handleCtaClick("Hero Secondary Button")}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-card-bg border border-light hover:bg-slate-200 dark:hover:bg-slate-800 text-foreground font-bold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              I&apos;m Interested
            </button>
          </div>

          {/* Trust Flags */}
          <div className="mt-14 flex items-center justify-center gap-5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-500">
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-[rgb(var(--color-primary))]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Vercel Deploy Ready</span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-[rgb(var(--color-primary))]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Supabase Schema Connected</span>
            </div>
          </div>
        </section>

        {/* 3. Features Section */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 py-16 border-t border-light relative">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Everything You Need to Launch
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              Discover the features making Damusia a game-changing tool for
              modern startup concepts.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-primary))] flex items-center justify-center mb-6 group-hover:scale-115 transition-transform duration-300">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Instant Validation
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Set up high-intent landing pages in minutes. Track clicks and
                  capture demographics directly into a Supabase database.
                </p>
              </div>
              <div className="mt-8 pt-4">
                <button
                  onClick={() => handleCtaClick("Feature 1 Details Button")}
                  className="text-xs font-bold text-[rgb(var(--color-primary))] hover:opacity-85 flex items-center gap-1 group-hover:translate-x-1.5 transition-all cursor-pointer"
                >
                  <span>Explore pre-launch</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-primary))] flex items-center justify-center mb-6 group-hover:scale-115 transition-transform duration-300">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Deep Demand Analytics
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Understand traffic and interest metrics without clunky setups.
                  Log click actions automatically to separate analytics logs for
                  easy query reporting.
                </p>
              </div>
              <div className="mt-8 pt-4">
                <button
                  onClick={() => handleCtaClick("Feature 2 Details Button")}
                  className="text-xs font-bold text-[rgb(var(--color-primary))] hover:opacity-85 flex items-center gap-1 group-hover:translate-x-1.5 transition-all cursor-pointer"
                >
                  <span>See analytics details</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-primary))] flex items-center justify-center mb-6 group-hover:scale-115 transition-transform duration-300">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Duplicate Protection
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Ensure database integrity with real-time queries. Stop
                  duplicate entries by checking phone numbers directly during
                  form submission.
                </p>
              </div>
              <div className="mt-8 pt-4">
                <button
                  onClick={() => handleCtaClick("Feature 3 Details Button")}
                  className="text-xs font-bold text-[rgb(var(--color-primary))] hover:opacity-85 flex items-center gap-1 group-hover:translate-x-1.5 transition-all cursor-pointer"
                >
                  <span>Review details</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-light bg-background/80 z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 relative">
                <Image
                  src="/logo.png"
                  alt="Damusia Logo"
                  width={24}
                  height={24}
                  style={{ height: "auto" }}
                  className="object-contain rounded"
                />
              </div>
              <span className="text-base font-bold text-foreground">
                {activeProjectName}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} {activeProjectName}. All rights
              reserved.
            </p>
          </div>

          <div className="flex items-center gap-6 text-slate-500 text-xs sm:text-sm">
            <a
              href="#github"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href="#twitter"
              className="hover:text-foreground transition-colors"
            >
              Twitter / X
            </a>
            <a
              href="#linkedin"
              className="hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>

      {/* The waitlist registration popup modal */}
      <WaitlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccessSubmit={handleSuccessSubmit}
        projectId={activeProjectId}
        projectName={activeProjectName}
      />
    </div>
  );
}
