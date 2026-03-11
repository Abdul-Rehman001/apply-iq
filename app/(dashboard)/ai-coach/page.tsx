import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { Sparkles, TrendingUp, Brain, AlertTriangle, BarChart2, ArrowRight } from "lucide-react";
import Link from "next/link";

async function getAnalyzedJobs(userId: string) {
  await dbConnect();
  const jobs = await Job.find({ userId, matchScore: { $ne: null } })
    .sort({ matchScore: -1 })
    .lean();
  return jobs;
}

function getMostCommonKeyword(jobs: any[]): string {
  const freq: Record<string, number> = {};
  for (const job of jobs) {
    for (const kw of (job.missingKeywords || [])) {
      freq[kw] = (freq[kw] || 0) + 1;
    }
  }
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || "—";
}

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 80 ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
    : score >= 60 ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
    : "bg-red-500/15 text-red-400 border-red-400/30";
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cls}`}>
      {score}% Match
    </span>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const cls = risk === "low" ? "bg-emerald-500/10 text-emerald-500"
    : risk === "medium" ? "bg-amber-500/10 text-amber-500"
    : "bg-red-500/10 text-red-400";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${cls}`}>
      {risk} risk
    </span>
  );
}

export default async function AICoachPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const allJobs = await getAnalyzedJobs(userId);
  const filter = searchParams.filter || "all";

  const filteredJobs = allJobs.filter((job: any) => {
    if (filter === "high") return job.matchScore >= 80;
    if (filter === "medium") return job.matchScore >= 60 && job.matchScore < 80;
    if (filter === "low") return job.matchScore < 60;
    return true;
  });

  const avgScore = allJobs.length
    ? Math.round(allJobs.reduce((sum: number, j: any) => sum + j.matchScore, 0) / allJobs.length)
    : 0;
  const topMissingKeyword = getMostCommonKeyword(allJobs);

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "high", label: "High (80+)" },
    { key: "medium", label: "Medium (60–79)" },
    { key: "low", label: "Low (<60)" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-text-primary">AI Coach</h1>
            <p className="text-sm text-text-secondary">All your job analyses in one place</p>
          </div>
        </div>
      </div>

      {allJobs.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-primary/50" />
          </div>
          <h2 className="text-xl font-extrabold text-text-primary mb-2">No analyses yet</h2>
          <p className="text-sm text-text-secondary max-w-sm mb-8">
            Add a job and paste the job description, then click "Analyze" to see your match score and coaching insights here.
          </p>
          <Link
            href="/jobs"
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-primary/20"
          >
            Go to My Jobs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Avg Match Score</p>
              </div>
              <p className={`text-3xl font-extrabold ${avgScore >= 75 ? "text-emerald-500" : avgScore >= 55 ? "text-amber-500" : "text-red-400"}`}>
                {avgScore}%
              </p>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Total Analyses</p>
              </div>
              <p className="text-3xl font-extrabold text-text-primary">{allJobs.length}</p>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Top Missing Skill</p>
              </div>
              <p className="text-lg font-extrabold text-text-primary truncate">{topMissingKeyword}</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-bg-surface border border-border-subtle rounded-xl p-1 mb-6 overflow-x-auto">
            {filterTabs.map((tab) => (
              <Link
                key={tab.key}
                href={`/ai-coach?filter=${tab.key}`}
                className={`flex-1 min-w-fit text-center py-2 px-3 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  filter === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Job List */}
          <div className="space-y-3">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12 text-text-tertiary text-sm">
                No jobs match this filter.
              </div>
            ) : (
              filteredJobs.map((job: any) => (
                <div key={job._id.toString()} className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm hover:border-primary/30 transition-colors flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-0.5">{job.company}</p>
                    <h3 className="text-sm font-extrabold text-text-primary truncate">{job.title}</h3>
                    {job.location && <p className="text-xs text-text-tertiary mt-0.5">{job.location}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ScoreBadge score={job.matchScore} />
                    {job.interviewRisk && <RiskBadge risk={job.interviewRisk} />}
                    <Link
                      href={`/jobs/${job._id}`}
                      className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors ml-2"
                    >
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
