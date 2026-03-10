"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base relative">
      <Sidebar
        user={user}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-30 lg:hidden flex items-center gap-3 px-4 py-3 bg-sidebar/90 backdrop-blur-md border-b border-border-subtle">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-sidebar-hover transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold text-text-primary">ApplyIQ</span>
      </div>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300",
        collapsed ? "lg:pl-[72px]" : "lg:pl-64"
      )}>
        <div className="px-4 py-6 sm:px-6 md:px-10 md:py-8 lg:px-12">
          {children}
        </div>
      </main>
    </div>
  );
}
