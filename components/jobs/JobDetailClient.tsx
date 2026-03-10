"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { 
  Bot, Sparkles, Building2, MapPin, DollarSign, ArrowLeft, 
  CheckCircle2, AlertTriangle, ShieldAlert, Target, Zap, 
  FileText, Copy, RefreshCw, ExternalLink, ChevronDown, ChevronUp
} from "lucide-react";

interface JobDetailProps {
  job: any;
}

export function JobDetailClient({ job }: JobDetailProps) {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(job.jobDescription || "");
  const [saving, setSaving] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(job.matchScore === undefined);
  
  // Tab states
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "contacts" | "activity">("overview");
  const [activeAITab, setActiveAITab] = useState<"coach" | "cover-letter">("coach");
  const [coverLetter, setCoverLetter] = useState(job.coverLetter || "");
  const [generatingLetter, setGeneratingLetter] = useState(false);

  const handleSaveDescription = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${job._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: description }),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("Description updated!");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update description");
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/jobs/${job._id}/analyze`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Analysis failed");

      toast.success("Job analyzed successfully!");
      router.refresh();
    } catch (error) {
      toast.error("Failed to analyze job");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateCoverLetter = async (forceRegenerate = false) => {
    setGeneratingLetter(true);
    try {
      const res = await fetch(`/api/jobs/${job._id}/cover-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRegenerate })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setCoverLetter(data.coverLetter);
      toast.success(forceRegenerate ? "Cover letter regenerated!" : "Cover letter generated!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate cover letter");
    } finally {
      setGeneratingLetter(false);
    }
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      
      {/* Top Navigation */}
      <Link href="/jobs" className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Job List
      </Link>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div>
              <h1 className="text-3xl font-extrabold text-text-primary tracking-tight leading-tight mb-3">
                 {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-secondary">
                  <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {job.company}</span>
                  {job.location && (
                     <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                  )}
                  {(job.salaryMin || job.salaryMax) && (
                     <span className="flex items-center gap-1.5 text-primary">
                        <DollarSign className="w-4 h-4" /> 
                        {job.salaryMin}{job.salaryMax ? ` - ${job.salaryMax}` : '+'}
                     </span>
                  )}
              </div>
          </div>
          <div className="flex gap-3 shrink-0">
             {job.jobUrl && (
                <a href={job.jobUrl} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-bg-surface-elevated text-text-primary font-bold rounded-xl border border-border-subtle hover:bg-bg-surface-hover transition-all flex items-center gap-2">
                   Job Post <ExternalLink className="w-4 h-4" />
                </a>
             )}
             <button className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-bg-base font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(166,137,250,0.3)]">
                 Update Status
             </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Column: Details */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* Status & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-text-tertiary tracking-widest uppercase">Application Status</h3>
                  <div className="flex bg-bg-surface border border-border-subtle rounded-xl p-1 shadow-sm">
                     <div className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-colors cursor-default ${job.status === 'saved' || job.status === 'applied' ? 'bg-primary/20 text-primary border border-primary/20 shadow-sm' : 'text-text-secondary'}`}>Applied</div>
                     <div className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-colors cursor-default ${job.status === 'interview' ? 'bg-primary/20 text-primary border border-primary/20 shadow-sm' : 'text-text-secondary'}`}>Interview</div>
                     <div className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-colors cursor-default ${job.status === 'offer' ? 'bg-primary/20 text-primary border border-primary/20 shadow-sm' : 'text-text-secondary'}`}>Offer</div>
                  </div>
               </div>
            </div>

            {/* Main Tabs */}
            <div className="border-b border-border-subtle flex gap-6">
               <button onClick={() => setActiveTab("overview")} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Overview</button>
               <button onClick={() => setActiveTab("notes")} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'notes' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Notes & Links</button>
            </div>

            {activeTab === "overview" && (
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Job Description</h2>
                     {!isEditing ? (
                        <button className="text-xs font-bold text-primary hover:text-primary-hover transition-colors" onClick={() => setIsEditing(true)}>Edit Text</button>
                     ) : (
                        <div className="flex gap-2">
                           <button className="text-xs font-bold text-text-secondary hover:text-text-primary" onClick={() => setIsEditing(false)}>Cancel</button>
                           <button className="text-xs font-bold text-primary hover:text-primary-hover" onClick={handleSaveDescription} disabled={saving}>{saving ? "Saving..." : "Save Content"}</button>
                        </div>
                     )}
                  </div>
                  
                  {isEditing ? (
                     <textarea
                        className="w-full h-[400px] p-4 text-sm bg-bg-surface-elevated border border-border-default rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Paste the job description here to enable AI analysis..."
                     />
                  ) : (
                     <div className="relative bg-bg-surface border border-border-subtle rounded-2xl p-6">
                        <div className={`whitespace-pre-wrap text-sm text-text-secondary leading-relaxed overflow-hidden transition-all duration-300 ${isDescriptionExpanded ? "" : "max-h-64"}`}>
                           {job.jobDescription || (
                              <div className="text-center py-8">
                                 <p className="text-text-primary font-bold mb-2">No Description Provided</p>
                                 <p className="opacity-70">Add the job description to unlock matching scores, targeted cover letters, and interview coaching.</p>
                              </div>
                           )}
                        </div>
                        
                        {job.jobDescription && !isDescriptionExpanded && (
                           <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg-surface to-transparent pointer-events-none rounded-b-2xl" />
                        )}
                        
                        {job.jobDescription && job.jobDescription.length > 500 && (
                           <div className="mt-4 flex justify-center">
                              <button 
                                 className="flex items-center gap-1.5 text-xs font-bold text-text-tertiary hover:text-text-primary transition-colors"
                                 onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                              >
                                 {isDescriptionExpanded ? (
                                    <><ChevronUp className="w-4 h-4" /> Show less</>
                                 ) : (
                                    <><ChevronDown className="w-4 h-4" /> Read full description</>
                                 )}
                              </button>
                           </div>
                        )}
                     </div>
                  )}
               </div>
            )}

            {activeTab === "notes" && (
               <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 text-center text-text-tertiary h-[200px] flex items-center justify-center text-sm font-medium">
                  Notes & Contacts feature currently under development
               </div>
            )}
         </div>

         {/* Right Column: AI Coach Analysis */}
         <div className="space-y-6">
            <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 relative overflow-hidden group shadow-lg">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
                     <Bot className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-sm font-extrabold text-text-primary">AI Coach Analysis</h3>
                     <p className="text-[10px] font-bold text-primary tracking-widest uppercase mt-0.5 text-glow">Smart Match Technology</p>
                  </div>
               </div>
               
               {/* Match Score Circle */}
               <div className="flex justify-center mb-8 relative">
                   <div className="w-36 h-36 relative flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                         <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="8" className="text-border-subtle" fill="none" />
                         <circle 
                            cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="8" 
                            className="text-primary transition-all duration-1500 ease-out shadow-[0_0_20px_rgba(166,137,250,0.5)]" 
                            fill="none" 
                            strokeLinecap="round"
                            strokeDasharray={402} 
                            strokeDashoffset={402 - (402 * (job.matchScore || 0)) / 100} 
                            style={{ filter: "drop-shadow(0 0 8px rgba(166,137,250,0.6))" }}
                         />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                         <span className="text-3xl font-extrabold text-text-primary">{job.matchScore || 0}<span className="text-xl text-text-tertiary">%</span></span>
                         <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase mt-1">Match Core</span>
                      </div>
                   </div>
               </div>

               {/* AI Tabs */}
               <div className="flex bg-bg-surface-elevated p-1 rounded-xl mb-6 border border-border-subtle">
                  <button onClick={() => setActiveAITab("coach")} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-sm ${activeAITab === "coach" ? "bg-primary text-bg-base" : "text-text-secondary hover:text-text-primary"}`}>Analysis</button>
                  <button onClick={() => setActiveAITab("cover-letter")} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-sm ${activeAITab === "cover-letter" ? "bg-primary text-bg-base" : "text-text-secondary hover:text-text-primary"}`}>Letter</button>
               </div>

               {/* Content based on AI Tab */}
               {activeAITab === "coach" && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     {job.whatsStrong ? (
                        <>
                           <div>
                              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-2">
                                 <CheckCircle2 className="w-4 h-4" /> Strong Match
                              </div>
                              <p className="text-xs text-text-secondary leading-relaxed bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                                 {job.whatsStrong}
                              </p>
                           </div>
                           
                           <div>
                              <div className="flex items-center gap-1.5 text-orange-400 text-xs font-bold mb-2">
                                 <AlertTriangle className="w-4 h-4" /> Experience Gaps
                              </div>
                              <p className="text-xs text-text-secondary leading-relaxed bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl">
                                 {job.biggestGap}
                              </p>
                           </div>
                           
                           {job.actionToday && (
                              <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl">
                                 <p className="text-xs font-bold text-primary mb-1 flex items-center gap-1.5">
                                    <Target className="w-4 h-4" /> Action Today
                                 </p>
                                 <p className="text-xs text-text-secondary leading-relaxed">{job.actionToday}</p>
                              </div>
                           )}
                           
                           <button 
                              className="w-full py-3 mt-2 bg-primary hover:bg-primary-hover text-bg-base font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                              onClick={handleAnalyze} disabled={analyzing}
                           >
                              {analyzing ? <><Sparkles className="w-4 h-4 animate-spin" /> Re-Analyzing...</> : <><Sparkles className="w-4 h-4" /> Update Analysis</>}
                           </button>
                        </>
                     ) : (
                        <div className="text-center py-6">
                           <p className="text-xs text-text-secondary mb-4">You have not analyzed this job description yet.</p>
                           <button 
                              className="w-full py-3 bg-primary hover:bg-primary-hover text-bg-base font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                              onClick={handleAnalyze} disabled={analyzing || !job.jobDescription}
                           >
                              {analyzing ? <><Sparkles className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Analyze with AI</>}
                           </button>
                        </div>
                     )}
                 </div>
               )}

               {activeAITab === "cover-letter" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                     {!coverLetter ? (
                        <div className="text-center py-6">
                           <p className="text-xs text-text-secondary mb-4">Generate a personalized cover letter using AI context.</p>
                           <button 
                              className="w-full py-3 bg-primary hover:bg-primary-hover text-bg-base font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                              onClick={() => handleGenerateCoverLetter()} disabled={generatingLetter || !job.jobDescription}
                           >
                              {generatingLetter ? <><Sparkles className="w-4 h-4 animate-spin" /> Generating...</> : <><FileText className="w-4 h-4" /> Generate Letter</>}
                           </button>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           <div className="flex justify-between items-center bg-bg-surface-elevated p-2 rounded-xl border border-border-subtle">
                              <span className="text-[10px] font-bold text-text-tertiary uppercase pl-2">Ready to use</span>
                              <div className="flex gap-1">
                                 <button onClick={handleCopyLetter} className="px-3 py-1.5 bg-bg-surface-elevated hover:bg-bg-surface-hover text-xs font-bold text-text-primary rounded-lg border border-border-default transition-colors flex items-center gap-1.5">
                                    <Copy className="w-3.5 h-3.5" /> Copy
                                 </button>
                                 <button onClick={() => handleGenerateCoverLetter(true)} disabled={generatingLetter} className="px-3 py-1.5 bg-bg-surface-elevated hover:bg-bg-surface-hover text-xs font-bold text-text-primary rounded-lg border border-border-default transition-colors flex items-center gap-1.5 disabled:opacity-50">
                                    <RefreshCw className={`w-3.5 h-3.5 ${generatingLetter ? 'animate-spin' : ''}`} /> Retry
                                 </button>
                              </div>
                           </div>
                           
                           <div className="bg-bg-surface-elevated border border-border-subtle p-4 rounded-xl max-h-[300px] overflow-y-auto scrollbar-hide text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                              {coverLetter}
                           </div>
                        </div>
                     )}
                  </div>
               )}

            </div>
            
            {/* Interview Prep Skeleton (Future Feature mentioned in Next Steps) */}
            <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm">
               <h3 className="text-sm font-extrabold text-text-primary mb-4">Interview Prep Summary</h3>
               <div className="space-y-3">
                  <div className="bg-bg-surface-elevated p-3 rounded-xl border border-border-subtle opacity-70">
                     <p className="text-xs font-bold text-text-secondary mb-1">Behavioral Question</p>
                     <p className="text-xs text-text-tertiary line-clamp-2">"Tell me about a time you had to defend a technical decision..."</p>
                  </div>
                  <div className="bg-bg-surface-elevated p-3 rounded-xl border border-border-subtle opacity-70">
                     <p className="text-xs font-bold text-text-secondary mb-1">Technical Focus</p>
                     <p className="text-xs text-text-tertiary">Prepare to discuss high-level architecture decisions.</p>
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
}
