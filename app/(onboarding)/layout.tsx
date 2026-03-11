"use client";

import { SessionProvider } from "next-auth/react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-bg-base flex flex-col">
        {/* Simple logo-only header */}
        <header className="px-6 py-5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center shadow-md shadow-primary/30">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-extrabold text-lg text-text-primary tracking-tight">ApplyIQ</span>
        </header>

        {/* Centered content area */}
        <main className="flex-1 flex items-start justify-center px-4 pt-6 pb-16">
          <div className="w-full max-w-xl">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
