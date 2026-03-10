import { AddJobModal } from "@/components/jobs/AddJobModal";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { 
  Send, 
  MessageSquare, 
  CalendarDays,
  Flame,
  Plus,
  ArrowUpRight,
  Briefcase,
  Bell,
  MoreHorizontal
} from "lucide-react";

import mongoose from "mongoose";

async function getAnalytics(userId: string) {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return { totalApplications: 0, interviews: 0, offers: 0, responseRate: 0, recentlyApplied: [] };
  }
  await dbConnect();
  const jobs = await Job.find({ userId }).sort({ updatedAt: -1 });

  const totalApplications = jobs.length;
  const interviews = jobs.filter(j => j.status === "interview").length;
  const offers = jobs.filter(j => j.status === "offer").length;
  
  const appliedJobs = jobs.filter(j => j.status !== "saved");
  const responses = jobs.filter(j => ["interview", "offer", "rejected"].includes(j.status));
  
  const responseRate = appliedJobs.length > 0 
    ? Math.round((responses.length / appliedJobs.length) * 100) 
    : 0;
    
  // Mock daily streak for now since data isn't tracked historically yet
  const dailyStreak = totalApplications > 0 ? 12 : 0;
  
  const recentlyApplied = jobs.slice(0, 3);
    
  return { totalApplications, interviews, offers, responseRate, dailyStreak, recentlyApplied };
}

export default async function DashboardPage() {
  const session = await auth();
  // @ts-ignore
  const stats = await getAnalytics(session?.user?.id);

  const statConfig = [
    { 
      label: "Total Applied", 
      value: stats.totalApplications, 
      icon: Send,
      color: "primary",
      delta: "+12%" 
    },
    { 
      label: "Response Rate", 
      value: `${stats.responseRate}%`, 
      icon: MessageSquare,
      color: "purple",
      delta: "+2%"
    },
    { 
      label: "Interviews", 
      value: stats.interviews, 
      icon: CalendarDays,
      color: "warning",
      delta: "-1%",
      negative: true
    },
    { 
      label: "Daily Streak", 
      value: stats.dailyStreak, 
      icon: Flame,
      color: "orange",
      delta: "+5%"
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-2">
            Good morning, {session?.user?.name?.split(' ')[0] || "User"} <span className="text-2xl">ðŸ‘‹</span>
          </h1>
          <p className="text-text-secondary mt-1 font-medium">
            You have {stats.interviews} interviews scheduled for this week.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 w-10 rounded-xl bg-bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
             <Bell className="h-4 w-4" />
          </button>
          <AddJobModal>
               <button className="h-10 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold px-5 text-sm transition-all shadow-md shadow-primary/20 flex items-center gap-2">
                 <Plus className="h-4 w-4" strokeWidth={3} />
                 Add New Job
               </button>
          </AddJobModal>
        </div>
      </div>

      {/* Main Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statConfig.map((stat) => (
          <div key={stat.label} className="bg-bg-surface border border-border-subtle p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-border-default transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border",
                  stat.color === 'primary' && "bg-blue-500/10 border-blue-500/20 text-blue-400",
                  stat.color === 'purple' && "bg-primary/10 border-primary/20 text-primary",
                  stat.color === 'warning' && "bg-amber-500/10 border-amber-500/20 text-amber-400",
                  stat.color === 'orange' && "bg-orange-500/10 border-orange-500/20 text-orange-400"
                )}>
                  <stat.icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
                
                <div className={cn(
                  "flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-full",
                  stat.negative 
                    ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                )}>
                  {stat.delta}
                </div>
              </div>
              
              <div>
                <p className="text-xs text-text-secondary font-medium tracking-wide mb-1">
                  {stat.label}
                </p>
                <div className="text-2xl font-bold text-text-primary flex items-center gap-2">
                  {stat.value}
                  {stat.label === "Daily Streak" && <span className="text-xl">ðŸ”¥</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section: Pipeline & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pipeline Preview Placeholder */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-text-primary tracking-tight">Applications Pipeline</h2>
           </div>
           
           <div className="rounded-2xl border border-border-subtle bg-bg-surface-elevated/50 p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 rounded-2xl bg-bg-surface border border-border-default flex items-center justify-center mb-4 shadow-sm">
                 <Briefcase className="h-6 w-6 text-text-tertiary" />
              </div>
              <h3 className="text-base font-bold text-text-primary mb-2">Build your pipeline</h3>
              <p className="text-sm text-text-secondary max-w-[250px] mx-auto mb-6">Track jobs across stages from Saved to Interview to Offer.</p>
              <AddJobModal>
                 <button className="px-5 py-2 rounded-xl border border-border-default text-text-primary text-sm font-semibold hover:bg-bg-surface-hover transition-colors">
                   Add a job now
                 </button>
               </AddJobModal>
           </div>
        </div>

        {/* Activity Feed Placeholder */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-text-primary tracking-tight">Recent Activity</h2>
              <button className="text-text-secondary hover:text-text-primary transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
           </div>
           
           <div className="rounded-2xl border border-border-subtle bg-bg-surface p-4 flex flex-col min-h-[300px]">
              {stats.recentlyApplied.length > 0 ? (
                <div className="space-y-4 flex-1">
                  {stats.recentlyApplied.map((job) => (
                     <div key={job._id.toString()} className="flex gap-4">
                        <div className="mt-1 relative">
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center z-10 relative">
                             <Send className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="absolute top-8 bottom-[-16px] left-1/2 w-px bg-border-subtle transform -translate-x-1/2" />
                        </div>
                        <div className="flex-1 pb-4">
                           <p className="text-sm font-bold text-white">Application Submitted</p>
                           <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                             Sent to {job.company} for {job.title} role
                           </p>
                           <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider mt-2">
                             Just now
                           </p>
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

