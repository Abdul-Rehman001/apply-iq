import { AddJobModal } from "@/components/jobs/AddJobModal";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { User } from "@/models/User";
import {
  Send, MessageSquare, CalendarDays, Flame, Plus, Briefcase,
  Bell, MoreHorizontal, CheckCircle2, Circle, ArrowRight,
  AlertTriangle, Sparkles, CalendarCheck
} from "lucide-react";
import mongoose from "mongoose";
import Link from "next/link";

async function getDashboardData(userId: string) {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return { totalApplications: 0, interviews: 0, offers: 0, responseRate: 0, recentlyApplied: [], user: null, focusItems: [], setupItems: [] };
  }
  await dbConnect();

  const [jobs, user] = await Promise.all([
    Job.find({ userId }).sort({ updatedAt: -1 }).lean(),
    User.findById(userId).select("resumeText completedOnboarding").lean(),
  ]);

  const totalApplications = jobs.length;
  const interviews = jobs.filter((j: any) => j.status === "interview").length;
  const offers = jobs.filter((j: any) => j.status === "offer").length;
  const appliedJobs = jobs.filter((j: any) => j.status !== "saved");
  const responses = jobs.filter((j: any) => ["interview", "offer", "rejected"].includes(j.status));
  const responseRate = appliedJobs.length > 0
    ? Math.round((responses.length / appliedJobs.length) * 100) : 0;
    
  let streak = 0;
  if (totalApplications > 0) {
    const uniqueDates = new Set(jobs.map((j: any) => {
      const d = new Date(j.createdAt);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }));
    
    let currentDate = new Date();
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    if (uniqueDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() - 1);
      if (uniqueDates.has(currentDate.getTime())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }
    
    while (uniqueDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
  }
  const dailyStreak = streak;
  
  const recentlyApplied = jobs.slice(0, 3);

  // ── Setup Checklist ──
  const hasResume = !!(user as any)?.resumeText && (user as any).resumeText.length > 50;
  const hasJobs = totalApplications > 0;
  const hasAnalysis = jobs.some((j: any) => j.matchScore !== null);
  const setupItems = [
    { key: "resume", done: hasResume, label: "Upload your resume", action: "Upload in Settings", href: "/settings" },
    { key: "job", done: hasJobs, label: "Add your first job", action: "Add a job", href: "/jobs" },
    { key: "analysis", done: hasAnalysis, label: "Run your first AI analysis", action: "Analyze a job", href: "/jobs" },
  ];
  const incompleteSetup = setupItems.filter((s) => !s.done);

  // ── Today's Focus ──
  const now = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const ago7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const ago14days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const focusItems: any[] = [];

  // Priority 1: Interviews this week
  const upcomingInterviews = jobs.filter((j: any) =>
    j.status === "interview" && j.followUpDate && new Date(j.followUpDate) <= in7days && new Date(j.followUpDate) >= now
  );
  for (const job of upcomingInterviews.slice(0, 3 - focusItems.length)) {
    focusItems.push({ type: "interview", job, label: "Interview coming up", action: "Prep with AI", href: `/jobs/${(job as any)._id}?tab=interview-prep` });
  }

  // Priority 2: Overdue follow-ups
  if (focusItems.length < 3) {
    const overdue = jobs.filter((j: any) =>
      j.status === "applied" && j.appliedDate && new Date(j.appliedDate) < ago7days
    );
    for (const job of overdue.slice(0, 3 - focusItems.length)) {
      focusItems.push({ type: "followup", job, label: "Follow-up overdue", action: "Send Follow-up", href: `/jobs/${(job as any)._id}?tab=notes` });
    }
  }

  // Priority 3: Stale jobs
  if (focusItems.length < 3) {
    const stale = jobs.filter((j: any) =>
      new Date(j.updatedAt) < ago14days && j.status !== "offer" && j.status !== "rejected"
    );
    for (const job of stale.slice(0, 3 - focusItems.length)) {
      focusItems.push({ type: "stale", job, label: "No updates in 14+ days", action: "Update Status", href: `/jobs/${(job as any)._id}` });
    }
  }

  return { totalApplications, interviews, offers, responseRate, dailyStreak, recentlyApplied, setupItems: incompleteSetup, focusItems, userResumeText: (user as any)?.resumeText || "" };
}

export default async function DashboardPage() {
  const session = await auth();
  const stats = await getDashboardData((session?.user as any)?.id || "");

  const statConfig = [
    { label: "Total Applied", value: stats.totalApplications, icon: Send, color: "primary", delta: "All time" },
    { label: "Response Rate", value: `${stats.responseRate}%`, icon: MessageSquare, color: "purple", delta: "Avg" },
    { label: "Interviews", value: stats.interviews, icon: CalendarDays, color: "warning", delta: "Active" },
    { label: "Daily Streak", value: stats.dailyStreak, icon: Flame, color: "orange", delta: "Days" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-2">
            Good morning, {session?.user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-text-secondary mt-1 font-medium">
            You have {stats.interviews} interviews scheduled for this week.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 w-10 rounded-xl bg-bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
            <Bell className="h-4 w-4" />
          </button>
          <AddJobModal userResumeText={stats.userResumeText}>
            <button className="h-10 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold px-5 text-sm transition-all shadow-md shadow-primary/20 flex items-center gap-2">
              <Plus className="h-4 w-4" strokeWidth={3} /> Add New Job
            </button>
          </AddJobModal>
        </div>
      </div>

      {/* Setup Checklist — only shown if any item incomplete */}
      {stats.setupItems.length > 0 && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl" />
          <div className="flex items-center justify-between mb-3 pl-2">
            <h2 className="text-sm font-extrabold text-text-primary">Get started</h2>
            <span className="text-xs font-bold text-text-tertiary">
              {3 - stats.setupItems.length} of 3 complete
            </span>
          </div>
          <div className="space-y-2.5 pl-2">
            {stats.setupItems.map((item: any) => (
              <div key={item.key} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Circle className="w-4 h-4 text-text-tertiary shrink-0" />
                  <span className="text-sm text-text-secondary">{item.label}</span>
                </div>
                <Link
                  href={item.href}
                  className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 shrink-0 transition-colors"
                >
                  {item.action} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statConfig.map((stat) => (
          <div key={stat.label} className="bg-bg-surface border border-border-subtle p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-border-default transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border",
                  stat.color === "primary" && "bg-blue-500/10 border-blue-500/20 text-blue-400",
                  stat.color === "purple" && "bg-primary/10 border-primary/20 text-primary",
                  stat.color === "warning" && "bg-amber-500/10 border-amber-500/20 text-amber-400",
                  stat.color === "orange" && "bg-orange-500/10 border-orange-500/20 text-orange-400"
                )}>
                  <stat.icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className={cn(
                  "flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-full",
                  (stat as any).negative
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                )}>
                  {stat.delta}
                </div>
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium tracking-wide mb-1">{stat.label}</p>
                <div className="text-2xl font-bold text-text-primary flex items-center gap-2">
                  {stat.value}
                  {stat.label === "Daily Streak" && <Sparkles className="h-5 w-5 text-orange-500" />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Focus */}
      {stats.focusItems.length > 0 ? (
        <div>
          <h2 className="text-lg font-extrabold text-text-primary tracking-tight mb-4">Today&apos;s Focus</h2>
          <div className="space-y-3">
            {stats.focusItems.map((item: any, i: number) => {
              const Icon = item.type === "interview" ? CalendarCheck
                : item.type === "followup" ? Send
                : AlertTriangle;
              const iconClass = item.type === "interview" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                : item.type === "followup" ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                : "text-orange-500 bg-orange-500/10 border-orange-500/20";
              const badgeClass = item.type === "interview" ? "text-emerald-500 bg-emerald-500/10"
                : item.type === "followup" ? "text-amber-500 bg-amber-500/10"
                : "text-orange-500 bg-orange-500/10";
              return (
                <div key={i} className="bg-bg-surface border border-border-subtle rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:border-border-default transition-colors">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border shrink-0", iconClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-tertiary font-medium truncate">{item.job.company}</p>
                    <p className="text-sm font-bold text-text-primary truncate">{item.job.title}</p>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", badgeClass)}>{item.label}</span>
                  </div>
                  <Link
                    href={item.href}
                    className="shrink-0 text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {item.action} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Only show "on top of everything" if user has some jobs and focus is empty */
        stats.setupItems.length === 0 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">You&apos;re on top of everything!</p>
          </div>
        )
      )}

      {/* Bottom Section: Pipeline & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-text-primary tracking-tight">Applications Pipeline</h2>
            <Link href="/jobs" className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-bg-surface-elevated/50 p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[280px]">
            <div className="w-16 h-16 rounded-2xl bg-bg-surface border border-border-default flex items-center justify-center mb-4 shadow-sm">
              <Briefcase className="h-6 w-6 text-text-tertiary" />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2">Build your pipeline</h3>
            <p className="text-sm text-text-secondary max-w-[250px] mx-auto mb-6">Track jobs across stages from Saved to Interview to Offer.</p>
            <AddJobModal userResumeText={stats.userResumeText}>
              <button className="px-5 py-2 rounded-xl border border-border-default text-text-primary text-sm font-semibold hover:bg-bg-surface-hover transition-colors">
                Add a job now
              </button>
            </AddJobModal>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-text-primary tracking-tight">Recent Activity</h2>
            <button className="text-text-secondary hover:text-text-primary transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-bg-surface p-4 flex flex-col min-h-[280px]">
            {stats.recentlyApplied.length > 0 ? (
              <div className="space-y-4 flex-1">
                {stats.recentlyApplied.map((job: any) => (
                  <div key={job._id.toString()} className="flex gap-4">
                    <div className="mt-1 relative">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center z-10 relative">
                        <Send className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="absolute top-8 bottom-[-16px] left-1/2 w-px bg-border-subtle transform -translate-x-1/2" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-bold text-text-primary">Application Added</p>
                      <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                        {job.company} — {job.title}
                      </p>
                      <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider mt-2">Recently</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <p className="text-sm font-medium text-text-secondary mb-1">No activity yet</p>
                <p className="text-xs text-text-tertiary">Activities will appear here</p>
              </div>
            )}
            <button className="w-full mt-4 py-2.5 rounded-xl bg-bg-surface-elevated hover:bg-border-subtle text-xs font-semibold text-text-primary transition-colors border border-border-subtle">
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
