import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { Job } from "@/models/Job";
import { 
  Users, 
  Briefcase, 
  Sparkles, 
  ArrowUpRight,
  Zap
} from "lucide-react";

async function getAdminStats() {
  await dbConnect();
  
  const totalUsers = await User.countDocuments();
  const totalJobs = await Job.countDocuments();
  const totalAIAnalyses = await Job.countDocuments({ aiAnalyzedAt: { $ne: null } });
  
  // Aggregate global AI usage + estimated historical usage
  const estimatedTokensPerAnalysis = 3500;
  
  // Aggregate jobs to find out how many analyses each user has done historically
  const jobAgg = await Job.aggregate([
    {
      $group: {
        _id: "$userId",
        jobCount: { $sum: 1 },
        analysesCount: { 
          $sum: { $cond: [{ $ne: ["$aiAnalyzedAt", null] }, 1, 0] } 
        }
      }
    }
  ]);
  
  const jobStatsMap = new Map(jobAgg.map(j => [j._id.toString(), { jobs: j.jobCount, analyses: j.analysesCount }]));

  // Get all users
  const allUsersRaw = await User.find({}, 'name email role createdAt totalAiTokens totalAiCalls').sort({ createdAt: -1 }).lean();
  
  let globalTotalTokens = 0;
  let globalTotalCalls = 0;

  const allUsers = allUsersRaw.map((u: { _id: { toString: () => string }, name?: string, email: string, role?: string, createdAt: string, totalAiTokens?: number, totalAiCalls?: number }) => {
    const jStats = jobStatsMap.get(u._id.toString()) || { jobs: 0, analyses: 0 };
    
    // Calculate estimated past usage for older accounts that have 0 tracked tokens
    const trackedTokens = u.totalAiTokens || 0;
    const trackedCalls = u.totalAiCalls || 0;
    
    const estimatedHistoricalTokens = (jStats.analyses * estimatedTokensPerAnalysis);
    
    // Only use estimation if they haven't started triggering the new exact tracking
    const finalTokens = trackedTokens > 0 ? trackedTokens : estimatedHistoricalTokens;
    const finalCalls = trackedCalls > 0 ? trackedCalls : jStats.analyses;

    globalTotalTokens += finalTokens;
    globalTotalCalls += finalCalls;

    return {
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      joinedAt: u.createdAt,
      totalTokens: finalTokens,
      totalCalls: finalCalls,
      jobCount: jStats.jobs
    };
  });
  
  // Get jobs per status across all users
  const statusCounts = await Job.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  return {
    totalUsers,
    totalJobs,
    totalAIAnalyses,
    totalTokens: globalTotalTokens,
    totalCalls: globalTotalCalls,
    recentUsers: allUsers.slice(0, 5),
    allUsers,
    statusCounts
  };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Simple Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight font-serif">Command Center</h1>
        <p className="text-sm text-text-secondary mt-1.5">Platform-wide overview of user engagement and AI performance.</p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        {[
          { label: "Total Platform Users", value: stats.totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
          { label: "Applications Tracked", value: stats.totalJobs, icon: Briefcase, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
          { label: "AI Powered Insights", value: stats.totalAIAnalyses, icon: Sparkles, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
          { label: "API Tokens Burned", value: stats.totalTokens, icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
        ].map((stat, i) => (
          <div key={i} className={`p-8 rounded-[2rem] bg-bg-surface border ${stat.border} shadow-sm transition-all hover:scale-[1.02]`}>
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6`}>
              <stat.icon size={24} />
            </div>
            <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">{stat.label}</p>
            <h3 className="text-4xl font-black text-text-primary tracking-tight">{stat.value.toLocaleString()}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent User Registrations */}
        <div className="bg-bg-surface border border-border-subtle rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-text-primary tracking-tight">Recent Onboardings</h3>
            <button className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-4">
            {stats.recentUsers.map((user: { id: string, name?: string, email: string, role?: string }) => (
              <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl bg-bg-surface-elevated/50 border border-border-subtle transition-all hover:bg-bg-surface-elevated">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/20">
                    {user.name ? user.name[0] : user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-text-primary leading-none mb-1">{user.name || "Anonymous User"}</h4>
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest leading-none">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${user.role === 'admin' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-text-tertiary/10 text-text-tertiary border border-text-tertiary/20'}`}>
                    {user.role || 'user'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Pipeline Health */}
        <div className="bg-bg-surface border border-border-subtle rounded-[2rem] p-8 shadow-sm flex flex-col justify-between">
          <h3 className="text-xl font-black text-text-primary tracking-tight mb-8">Global Pipeline Status</h3>
          <div className="grid grid-cols-2 gap-4">
             {stats.statusCounts.map((s: { _id: string, count: number }) => (
               <div key={s._id} className="p-5 rounded-2xl bg-bg-surface-elevated/30 border border-border-subtle flex flex-col items-center text-center">
                  <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1">{s._id}</span>
                  <span className="text-2xl font-black text-text-primary">{s.count}</span>
               </div>
             ))}
          </div>
          <div className="mt-8 pt-8 border-t border-border-subtle">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-xs font-bold text-text-secondary">System is active and processing global tracking data.</p>
             </div>
          </div>
        </div>
      </div>

      {/* DETAILED USER ACTIVITY LOGS */}
      <div className="bg-bg-surface border border-border-subtle rounded-[2rem] shadow-sm overflow-hidden flex flex-col mt-10">
        <div className="p-8 border-b border-border-subtle">
          <h3 className="text-xl font-black text-text-primary tracking-tight">Detailed User Activity</h3>
          <p className="text-xs text-text-secondary mt-1 font-medium">Breakdown of platform engagement and token usage per account.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-surface-elevated/30 border-b border-border-subtle text-[10px] uppercase tracking-widest font-black text-text-tertiary">
                <th className="p-5">User</th>
                <th className="p-5">Role</th>
                <th className="p-5 text-right">Jobs Tracked</th>
                <th className="p-5 text-right">AI Actions</th>
                <th className="p-5 text-right">Tokens Used</th>
                <th className="p-5 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {stats.allUsers.map((user: { id: string, name?: string, email: string, role?: string, jobCount: number, totalCalls: number, totalTokens: number, joinedAt: string }) => (
                <tr key={user.id} className="hover:bg-bg-surface-elevated/50 transition-colors">
                  <td className="p-5">
                    <div className="font-extrabold text-sm text-text-primary">{user.name || "Anonymous"}</div>
                    <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mt-0.5">{user.email}</div>
                  </td>
                  <td className="p-5">
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${user.role === 'admin' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-text-tertiary/10 text-text-tertiary border border-text-tertiary/20'}`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="p-5 text-right font-mono text-sm font-bold text-text-secondary">{user.jobCount}</td>
                  <td className="p-5 text-right font-mono text-sm font-bold text-text-secondary">{user.totalCalls}</td>
                  <td className="p-5 text-right">
                    <div className="font-mono text-sm font-black text-primary">{user.totalTokens.toLocaleString()}</div>
                  </td>
                  <td className="p-5 text-right text-xs font-bold text-text-tertiary uppercase tracking-wider">
                    {new Date(user.joinedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
