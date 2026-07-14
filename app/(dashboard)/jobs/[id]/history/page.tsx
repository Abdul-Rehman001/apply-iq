import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import Link from "next/link";
import { ArrowLeft, TrendingUp, CheckCircle2, AlertTriangle, Lightbulb, Check, Wand2, MinusCircle, Brain } from "lucide-react";

async function getJobHistory(id: string, userId: string) {
  await dbConnect();
  const job = await Job.findOne({ _id: id, userId });
  return job ? JSON.parse(JSON.stringify(job)) : null;
}

const DiffViewer = ({ oldText, newText, label }: { oldText: string; newText: string; label: string }) => {
  if (oldText === newText) return null;
  return (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-border-default" />
        <h4 className="text-sm font-bold text-text-secondary">{label}</h4>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Original */}
        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-5 relative group transition-colors hover:border-red-500/20">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500/30 rounded-l-xl transition-all group-hover:bg-red-500/50" />
          <p className="text-[10px] font-bold text-red-600/70 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <MinusCircle className="w-3.5 h-3.5" /> Original
          </p>
          <p className="text-sm text-text-secondary line-through opacity-60 leading-relaxed font-medium">{oldText}</p>
        </div>
        {/* Tailored */}
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5 relative shadow-[0_2px_10px_-4px_rgba(16,185,129,0.1)] group transition-colors hover:border-emerald-500/30">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 rounded-l-xl" />
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Tailored
          </p>
          <p className="text-sm text-text-primary font-semibold leading-relaxed">{newText}</p>
        </div>
      </div>
    </div>
  );
};

export default async function ResumeHistoryPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const job = await getJobHistory(params.id, session.user.id);
  if (!job) {
    redirect("/jobs");
  }

  const history = job.resumeHistory || [];

  return (
    <div className="space-y-6 pb-20">
      <Breadcrumb
        items={[
          { label: "AI Coach", href: "/ai-coach" },
          { label: job.company, href: `/jobs/${job._id}` },
          { label: "Tailoring History" },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Resume Tailoring History</h1>
          <p className="text-sm text-text-secondary mt-1.5">Track how your resume improved for <strong className="text-text-primary">{job.title}</strong> at <strong className="text-text-primary">{job.company}</strong></p>
        </div>
        <Link 
          href="/ai-coach"
          className="px-5 py-2.5 bg-bg-surface-elevated hover:bg-bg-surface-hover border border-border-default text-text-primary text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Coach
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-16 text-center shadow-sm mt-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-primary/20">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">No Tailoring History Yet</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">Go to the AI Coach and run the Auto-Tailor tool to start optimizing your resume and tracking improvements.</p>
          <Link href="/ai-coach" className="inline-block mt-8 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg shadow-md hover:bg-primary-hover transition-colors">
            Go to AI Coach
          </Link>
        </div>
      ) : (
        <div className="relative mt-8 md:mt-12">
          {/* Main vertical line for timeline */}
          <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-border-default rounded-full" />
          
          <div className="space-y-16">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {history.map((entry: any, index: number) => {
              const isOriginal = index === 0;
              const score = entry.analysis?.matchScore || 0;
              
              const prevScore = index > 0 ? (history[index - 1].analysis?.matchScore || 0) : null;
              const diff = prevScore !== null ? score - prevScore : 0;
              
              // Extract diffs against baseline
              const originalJson = history[0]?.resumeJson;
              const currentJson = entry.resumeJson;
              const oldObjective = originalJson?.basics?.objective || "";
              const newObjective = currentJson?.basics?.objective || "";

              return (
                <div key={index} className="relative pl-14 sm:pl-16">
                  {/* Timeline Node */}
                  <div className={`absolute left-[15px] top-6 w-[18px] h-[18px] rounded-full border-[3px] border-bg-base shadow-sm flex items-center justify-center ring-4 ring-bg-surface z-10 ${isOriginal ? 'bg-primary/80' : 'bg-primary'}`}>
                    {isOriginal && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    {!isOriginal && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                  </div>
                  
                  <div className={`bg-bg-surface rounded-2xl overflow-hidden transition-all duration-300 ${isOriginal ? 'border-2 border-border-default shadow-sm' : 'border border-primary/20 shadow-xl shadow-primary/5'}`}>
                    
                    {/* Header Strip */}
                    <div className="px-6 md:px-8 py-5 border-b border-border-subtle bg-bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-extrabold text-text-primary tracking-tight font-serif">
                            {isOriginal ? "Original Baseline" : `Tailored Version ${index}`}
                          </h3>
                          {isOriginal && <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-widest border border-primary/20">Uploaded Resume</span>}
                          {!isOriginal && <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] uppercase font-black tracking-widest border border-primary/20 shadow-sm shadow-primary/10">AI Optimized</span>}
                        </div>
                        <p className="text-xs font-medium text-text-tertiary mt-2">
                          {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-start sm:items-end">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Match Score</span>
                          <span className={`text-3xl font-black tracking-tight font-mono ${score >= 75 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                            {score}%
                          </span>
                        </div>
                        {!isOriginal && diff !== 0 && (
                          <div className={`flex items-center gap-1.5 mt-1 text-xs font-bold font-mono px-2 py-0.5 rounded-full ${diff > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                            {diff > 0 ? '↗' : '↘'} {Math.abs(diff)}% vs previous
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 md:p-8 space-y-10">
                      
                      {/* Explicit Text Diffs against Baseline FIRST (If Tailored) */}
                      {!isOriginal && (oldObjective !== newObjective || currentJson?.work?.[0]?.bullets?.[0] !== originalJson?.work?.[0]?.bullets?.[0]) && (
                        <div>
                          <div className="mb-6 flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                               <Wand2 className="w-5 h-5 text-primary" />
                             </div>
                             <div>
                               <h4 className="text-base font-extrabold text-text-primary tracking-tight">Content Improvements</h4>
                               <p className="text-xs text-text-secondary mt-0.5 font-medium">Exact wording changes applied by AI to align with job requirements.</p>
                             </div>
                          </div>
                          
                          <div className="pl-0 sm:pl-13 space-y-6">
                            <DiffViewer 
                              oldText={oldObjective} 
                              newText={newObjective} 
                              label="Professional Summary" 
                            />
                            
                            {currentJson?.work?.[0]?.bullets?.map((bullet: string, idx: number) => (
                              <DiffViewer 
                                key={idx} 
                                oldText={originalJson?.work?.[0]?.bullets?.[idx] || ""} 
                                newText={bullet} 
                                label={`Experience: ${currentJson?.work?.[0]?.company || 'Entry'} — Bullet ${idx + 1}`} 
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Divider between Diffs and Analysis (If Tailored) */}
                      {!isOriginal && <hr className="border-border-subtle" />}

                      {/* Analysis Grid (Moved Below) */}
                      <div>
                        {!isOriginal && (
                          <div className="mb-6 flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-bg-surface-elevated flex items-center justify-center border border-border-default">
                                 <Brain className="w-5 h-5 text-text-secondary" />
                               </div>
                               <div>
                                 <h4 className="text-base font-extrabold text-text-primary tracking-tight">AI Evaluation</h4>
                                 <p className="text-xs text-text-secondary mt-0.5 font-medium">Strategic analysis and remaining gaps for this version.</p>
                               </div>
                          </div>
                        )}

                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!isOriginal ? "pl-0 sm:pl-13" : ""}`}>
                          {/* Strongest/Gap Boxes */}
                          <div className="space-y-4">
                            <div className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-sm">
                              <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">
                                <CheckCircle2 className="w-4 h-4" /> Strongest Point
                              </h4>
                              <p className="text-sm text-text-primary leading-relaxed font-medium">
                                {entry.analysis?.whatsStrong || "No data available."}
                              </p>
                            </div>
                            <div className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-sm">
                              <h4 className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">
                                <AlertTriangle className="w-4 h-4" /> Remaining Gap
                              </h4>
                              <p className="text-sm text-text-primary leading-relaxed font-medium">
                                {entry.analysis?.biggestGap || "No data available."}
                              </p>
                            </div>
                          </div>

                          {/* Feedback Box */}
                          <div className="bg-bg-surface-elevated rounded-xl p-5 md:p-6 border border-border-subtle">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-5">
                              <Lightbulb className="w-4 h-4" /> Recommended Next Steps
                            </h4>
                            {entry.analysis?.improvementTips?.length > 0 ? (
                              <ul className="space-y-4">
                                {entry.analysis.improvementTips.map((tip: string, i: number) => (
                                  <li key={i} className="text-sm text-text-secondary flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                    <span className="leading-relaxed font-medium">{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-text-tertiary italic">No specific feedback provided.</p>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
