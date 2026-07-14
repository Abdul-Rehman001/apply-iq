/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { X, FileDown, Loader2, LayoutTemplate, RefreshCw, Wand2, History, ChevronRight, CheckCircle2, Edit } from "lucide-react";
import { PDFTemplate } from "./PDFTemplate";
import { pdf } from "@react-pdf/renderer";
import { motion, AnimatePresence } from "framer-motion";
import { Dropdown } from "@/components/ui/Dropdown";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-bg-surface-elevated rounded-xl border border-dashed border-border-default"><Loader2 className="animate-spin text-primary w-8 h-8" /></div> }
);

import { useRouter } from "next/navigation";
import { IJob } from "@/types";

interface ResumeTailorModalProps {
  job: IJob;
  open: boolean;
  onClose: () => void;
}

// Simulated stream messages for the progressive loading state
const STREAM_MESSAGES = [
  "Parsing Job Description requirements...",
  "Identifying missing ATS keywords...",
  "Rewriting Professional Summary...",
  "Optimizing Work Experience bullets...",
  "Reordering skills based on relevance...",
  "Scoring new tailored resume..."
];
const CollapsibleSection = ({ title, children, defaultOpen = false, icon: Icon }: { title: string, children: React.ReactNode, defaultOpen?: boolean, icon?: any }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-border-subtle rounded-md overflow-hidden bg-bg-surface shadow-sm mb-3">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-surface hover:bg-bg-surface-hover transition-colors"
      >
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-text-secondary" />} {title}
        </h3>
        <ChevronRight className={`w-4 h-4 text-text-tertiary transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && <div className="p-4 border-t border-border-subtle bg-bg-base space-y-4">{children}</div>}
    </div>
  );
};

export function ResumeTailorModal({ job, open, onClose }: ResumeTailorModalProps) {
  const router = useRouter();
  
  // States
  const [loading, setLoading] = useState(true);
  const [streamIndex, setStreamIndex] = useState(0);
  const [resumeData, setResumeData] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"diff" | "settings">("diff");
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [mobileView, setMobileView] = useState<"editor" | "preview">("preview");
  const [selectedVersionIndex, setSelectedVersionIndex] = useState<number>(0);

  // Progressive streaming simulation
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setStreamIndex(prev => Math.min(prev + 1, STREAM_MESSAGES.length - 1));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const tailorResume = useCallback(async (isMounted = true) => {
    setLoading(true);
    setStreamIndex(0);
    try {
      const res = await fetch(`/api/jobs/${job._id}/tailor`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (isMounted) {
        setResumeData(data.tailoredJson);
        setHistory(data.history || []);
        setSelectedVersionIndex(data.history.length - 1);
        setActiveTab("diff");
        router.refresh(); 
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to tailor resume");
      if (isMounted && !resumeData) onClose();
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [job, onClose, resumeData, router]);

  const hasRequested = React.useRef(false);

  useEffect(() => {
    if (!open) {
      hasRequested.current = false;
      return;
    }
    let isMounted = true;
    if (job.tailoredResume && job.resumeHistory && job.resumeHistory.length > 0) {
      setResumeData(job.tailoredResume);
      setHistory(job.resumeHistory);
      setSelectedVersionIndex(job.resumeHistory.length - 1);
      setLoading(false);
    } else {
      if (!hasRequested.current) {
        hasRequested.current = true;
        tailorResume(isMounted);
      }
    }
    return () => { isMounted = false; };
  }, [open, job, tailorResume]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const handleDownload = async () => {
    if (!resumeData) return;
    const toastId = toast.loading("Generating PDF...");
    try {
      const blob = await pdf(<PDFTemplate data={resumeData} template={activeTemplate} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Tailored_${job.company.replace(/\s+/g, "_")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Resume downloaded!", { id: toastId });
    } catch {
      toast.error("Failed to download PDF", { id: toastId });
    }
  };

  const templates = [
    { id: "classic", name: "Classic Professional" },
    { id: "centered", name: "Centered (New)" },
    { id: "modern", name: "Modern Minimal" },
    { id: "tech", name: "Tech Startup" },
  ];

  // Helper for Diffs
  const originalJson = history[0]?.resumeJson;
  const currentJson = history[selectedVersionIndex]?.resumeJson;
  
  // Safe extraction of changes
  const oldObjective = originalJson?.basics?.objective || "";
  const newObjective = currentJson?.basics?.objective || "";
  
  const TextDiff = ({ oldText, newText, label }: { oldText: string; newText: string, label: string }) => {
    if (oldText === newText) return null; // Hide if unchanged to reduce clutter
    return (
      <div className="mb-6 bg-bg-surface-elevated border border-border-subtle rounded-md overflow-hidden">
        <div className="bg-bg-surface border-b border-border-subtle px-4 py-2">
          <h4 className="text-xs font-bold tracking-wider text-text-tertiary uppercase">{label}</h4>
        </div>
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider">Removed</span>
            <p className="text-sm text-text-secondary line-through opacity-70">{oldText}</p>
          </div>
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Added</span>
            <p className="text-sm text-text-primary font-medium">{newText}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-[98vw] max-w-400 h-[96vh] bg-bg-surface border border-border-subtle rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between px-4 sm:px-6 py-4 border-b border-border-subtle bg-bg-surface shrink-0 gap-4 relative">
          <div className="pr-10 lg:pr-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <Wand2 className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-text-primary">Tailoring Studio</h2>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-1.5 flex flex-wrap items-center gap-1">
              Tailoring for <strong className="text-text-primary truncate max-w-30 sm:max-w-50">{job.title}</strong> at <strong className="text-text-primary truncate max-w-30 sm:max-w-50">{job.company}</strong>
            </p>
          </div>
          
          <button onClick={onClose} className="absolute top-4 right-4 lg:hidden w-8 h-8 flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary bg-bg-surface-elevated border border-border-subtle shadow-sm">
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
            {!loading && history.length > 1 && (
              <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-3 px-3 sm:px-4 bg-bg-surface-elevated rounded-md border border-border-subtle shadow-inner h-10 w-full sm:w-auto">
                <div className="text-center flex flex-col justify-center">
                  <p className="text-[9px] font-bold text-text-tertiary uppercase leading-tight">Original</p>
                  <p className="text-sm font-bold text-text-secondary leading-tight">{history[0].analysis?.matchScore || job.matchScore}%</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-tertiary" />
                <div className="text-center flex flex-col justify-center">
                  <p className="text-[9px] font-bold text-primary uppercase leading-tight">New Match</p>
                  <p className="text-sm font-black text-emerald-500 leading-tight">{history[history.length - 1].analysis?.matchScore}%</p>
                </div>
              </div>
            )}
            
            {!loading && resumeData && (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => tailorResume()}
                  className="flex-1 sm:flex-none justify-center bg-bg-surface-elevated hover:bg-bg-surface-hover border border-border-default text-text-primary font-bold text-xs sm:text-sm px-3 sm:px-4 h-10 rounded-md transition-all shadow-sm flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Re-Tailor
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 sm:flex-none justify-center bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs sm:text-sm px-3 sm:px-6 h-10 rounded-md transition-all shadow-md flex items-center gap-2"
                >
                  <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> PDF
                </button>
              </div>
            )}
            <button onClick={onClose} className="hidden lg:flex w-10 h-10 items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover border border-transparent hover:border-border-default transition-all ml-2">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Workspace Layout */}
        
        {/* Mobile View Toggle */}
        <div className="flex lg:hidden w-full border-b border-border-subtle bg-bg-surface shrink-0 z-20 shadow-sm relative">
          <button 
            onClick={() => setMobileView("editor")}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${mobileView === "editor" ? "border-primary text-primary" : "border-transparent text-text-secondary"}`}
          >
            Editor Workspace
          </button>
          <button 
            onClick={() => setMobileView("preview")}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${mobileView === "preview" ? "border-primary text-primary" : "border-transparent text-text-secondary"}`}
          >
            PDF Preview
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-bg-base">
          
          {/* Left Panel: Workspace (Diffs & Settings) */}
          <div className={`${mobileView === "editor" ? "flex" : "hidden"} lg:flex w-full lg:w-[45%] flex-col border-b lg:border-b-0 lg:border-r border-border-subtle bg-bg-surface lg:shadow-xl z-10 flex-1 min-h-0 shrink-0`}>
            
            {/* Tabs */}
            <div className="flex items-center px-2 pt-2 border-b border-border-subtle bg-bg-surface shrink-0">
              <button 
                onClick={() => setActiveTab("diff")}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === "diff" ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-default"}`}
              >
                <History className="w-4 h-4" /> AI Edits
              </button>
              <button 
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === "settings" ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-default"}`}
              >
                <Edit className="w-4 h-4" /> Manual Edit
              </button>
            </div>

            {/* Left Panel Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-bg-surface">
                   <div className="w-16 h-16 relative mb-6">
                     <div className="absolute inset-0 rounded-full border-4 border-border-subtle" />
                     <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                   </div>
                   <h3 className="text-lg font-bold text-text-primary mb-2">Analyzing & Tailoring...</h3>
                   <div className="h-8 overflow-hidden">
                     <AnimatePresence mode="wait">
                       <motion.p
                         key={streamIndex}
                         initial={{ y: 20, opacity: 0 }}
                         animate={{ y: 0, opacity: 1 }}
                         exit={{ y: -20, opacity: 0 }}
                         transition={{ duration: 0.3 }}
                         className="text-sm text-primary font-medium"
                       >
                         {STREAM_MESSAGES[streamIndex]}
                       </motion.p>
                     </AnimatePresence>
                   </div>
                </div>
              ) : activeTab === "diff" ? (
                <div className="p-6">
                  {/* Timeline Selector */}
                  <div className="mb-8">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Viewing Iteration</label>
                    <Dropdown
                      value={selectedVersionIndex.toString()}
                      onChange={(val) => {
                        const idx = Number(val);
                        setSelectedVersionIndex(idx);
                        setResumeData(history[idx].resumeJson);
                      }}
                      options={history.map((h, i) => ({
                        value: i.toString(),
                        label: `${h.version} — Match Score: ${h.analysis?.matchScore || '?'}%`
                      }))}
                      className="w-full shadow-sm"
                    />
                  </div>

                  {selectedVersionIndex === 0 ? (
                    <div className="text-center py-12 px-4">
                      <div className="w-16 h-16 bg-bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4 border border-border-default">
                        <CheckCircle2 className="w-8 h-8 text-text-tertiary" />
                      </div>
                      <h4 className="text-lg font-bold text-text-primary mb-2">Original Baseline</h4>
                      <p className="text-sm text-text-secondary">This is your original uploaded resume. Select a tailored iteration from the dropdown above to see AI modifications.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4">
                        <Wand2 className="w-4 h-4 text-primary" /> Key AI Improvements
                      </h3>
                      
                      {/* Analysis Delta (If available) */}
                      {history[selectedVersionIndex]?.analysis?.improvementTips?.length > 0 && (
                        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-md space-y-2">
                          <p className="text-xs font-bold text-primary uppercase tracking-wider">AI Reasoning</p>
                          <ul className="list-disc pl-4 space-y-1">
                            {history[selectedVersionIndex].analysis.improvementTips.map((tip: string, i: number) => (
                              <li key={i} className="text-sm text-text-primary">{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Diffs */}
                      <TextDiff oldText={oldObjective} newText={newObjective} label="Professional Summary" />
                      
                      {/* Iterating Work Bullets (Just checking top job for brevity) */}
                      {currentJson?.work?.[0]?.bullets?.map((bullet: string, idx: number) => (
                        <TextDiff 
                          key={idx} 
                          oldText={originalJson?.work?.[0]?.bullets?.[idx] || ""} 
                          newText={bullet} 
                          label={`Experience: ${currentJson?.work?.[0]?.company || 'Entry'} (Bullet ${idx + 1})`} 
                        />
                      ))}
                      
                      {/* If no diffs found directly in top sections */}
                      {oldObjective === newObjective && (
                        <p className="text-sm text-text-secondary italic p-4 bg-bg-surface-elevated rounded-xl text-center">
                          Minor structural optimizations made. Content mostly untouched.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 space-y-2 animate-in fade-in duration-200">
                  <CollapsibleSection title="Design Template" icon={LayoutTemplate} defaultOpen>
                    <div className="grid grid-cols-2 gap-3">
                      {templates.map((tpl) => (
                        <button
                          key={tpl.id}
                          onClick={() => setActiveTemplate(tpl.id)}
                          className={`text-left px-4 py-3 rounded-md border text-sm font-bold transition-all ${
                            activeTemplate === tpl.id 
                              ? 'border-primary bg-primary/10 text-primary shadow-sm' 
                              : 'border-border-default hover:border-border-hover text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
                          }`}
                        >
                          {tpl.name}
                        </button>
                      ))}
                    </div>
                  </CollapsibleSection>

                  <CollapsibleSection title="Section Overrides">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['summary', 'skills', 'experience', 'projects', 'education'].map((key) => {
                        const labels: Record<string, string> = { summary: "Summary", skills: "Skills", experience: "Experience", projects: "Projects", education: "Education" };
                        return (
                          <div key={key} className="space-y-1.5">
                            <label className="text-xs font-bold text-text-secondary">{labels[key]}</label>
                            <input 
                              type="text"
                              className="w-full bg-bg-surface border border-border-default rounded-md px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary shadow-sm"
                              value={resumeData?.headings?.[key] || labels[key].toUpperCase()}
                              onChange={(e) => setResumeData({...resumeData, headings: { ...(resumeData.headings || {}), [key]: e.target.value.toUpperCase() }})}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleSection>

                  <CollapsibleSection title="Contact Links">
                    <div className="space-y-3">
                      {resumeData?.basics?.links?.map((link: string, idx: number) => (
                        <div key={idx} className="flex gap-2">
                          <input 
                            type="text"
                            className="flex-1 bg-bg-surface border border-border-default rounded-md px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary shadow-sm"
                            value={link}
                            placeholder="https://github.com/username"
                            onChange={(e) => {
                              const newLinks = [...(resumeData.basics.links || [])];
                              newLinks[idx] = e.target.value;
                              setResumeData({...resumeData, basics: {...resumeData.basics, links: newLinks}});
                            }}
                          />
                          <button onClick={() => setResumeData({...resumeData, basics: {...resumeData.basics, links: resumeData.basics.links.filter((_: any, i: number) => i !== idx)}})} className="px-3 py-2 bg-red-500/10 text-red-500 rounded-md font-bold">X</button>
                        </div>
                      ))}
                      <button onClick={() => setResumeData({...resumeData, basics: {...resumeData.basics, links: [...(resumeData?.basics?.links || []), "https://"]}})} className="text-xs font-bold text-primary hover:text-primary-hover">+ Add Link</button>
                    </div>
                  </CollapsibleSection>

                  <CollapsibleSection title="Professional Summary">
                    <textarea 
                      className="w-full h-32 bg-bg-surface border border-border-default rounded-md px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 shadow-sm"
                      value={resumeData?.basics?.objective || ""}
                      onChange={(e) => setResumeData({...resumeData, basics: {...resumeData.basics, objective: e.target.value}})}
                    />
                  </CollapsibleSection>
                  
                  <CollapsibleSection title="Skills">
                    {resumeData?.skills && Object.entries(resumeData.skills).map(([category, keywords], idx: number) => (
                      <div key={idx} className="space-y-2 mb-4 p-3 bg-bg-surface rounded-md border border-border-subtle">
                        <input 
                          className="w-full bg-bg-surface border border-border-default rounded-md px-3 py-2 text-sm font-bold text-text-primary" 
                          value={category} 
                          onChange={(e) => { 
                            const newSkills = { ...resumeData.skills }; 
                            const newCat = e.target.value;
                            const vals = newSkills[category];
                            delete newSkills[category];
                            newSkills[newCat] = vals;
                            setResumeData({...resumeData, skills: newSkills}); 
                          }} 
                        />
                        <textarea 
                          className="w-full h-20 bg-bg-surface border border-border-default rounded-md px-3 py-2 text-sm text-text-primary" 
                          value={(keywords as string) || ""} 
                          onChange={(e) => { 
                            const newSkills = { ...resumeData.skills }; 
                            newSkills[category] = e.target.value;
                            setResumeData({...resumeData, skills: newSkills}); 
                          }} 
                        />
                      </div>
                    ))}
                  </CollapsibleSection>

                  <CollapsibleSection title="Experience">
                    {resumeData?.work?.map((job: any, idx: number) => (
                      <div key={idx} className="space-y-3 mb-6 p-4 bg-bg-surface rounded-md border border-border-subtle">
                        <div className="grid grid-cols-2 gap-3">
                          <input className="w-full bg-bg-surface border border-border-default rounded-md px-3 py-2 text-sm font-bold text-text-primary" value={job.company || ""} placeholder="Company Name" onChange={(e) => { const newWork = [...resumeData.work]; newWork[idx].company = e.target.value; setResumeData({...resumeData, work: newWork}); }} />
                          <input className="w-full bg-bg-surface border border-border-default rounded-md px-3 py-2 text-sm text-text-primary" value={job.position || ""} placeholder="Position" onChange={(e) => { const newWork = [...resumeData.work]; newWork[idx].position = e.target.value; setResumeData({...resumeData, work: newWork}); }} />
                        </div>
                        <div className="space-y-2">
                          {job.bullets?.map((bullet: string, bIdx: number) => (
                            <textarea key={bIdx} className="w-full h-16 bg-bg-surface border border-border-default rounded-md px-3 py-2 text-sm text-text-primary" value={bullet || ""} onChange={(e) => { const newWork = [...resumeData.work]; newWork[idx].bullets[bIdx] = e.target.value; setResumeData({...resumeData, work: newWork}); }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </CollapsibleSection>

                  <CollapsibleSection title="Projects">
                    {resumeData?.projects?.map((project: any, idx: number) => (
                      <div key={idx} className="space-y-3 mb-6 p-4 bg-bg-surface rounded-md border border-border-subtle">
                        <div className="grid grid-cols-2 gap-3">
                           <input className="w-full bg-bg-surface border border-border-default rounded-md px-3 py-2 text-sm font-bold text-text-primary" value={project.name || ""} placeholder="Project Name" onChange={(e) => { const newP = [...resumeData.projects]; newP[idx].name = e.target.value; setResumeData({...resumeData, projects: newP}); }} />
                           <input className="w-full bg-bg-surface border border-border-default rounded-md px-3 py-2 text-sm text-text-primary" value={project.link || ""} placeholder="Project Link" onChange={(e) => { const newP = [...resumeData.projects]; newP[idx].link = e.target.value; setResumeData({...resumeData, projects: newP}); }} />
                        </div>
                        <div className="space-y-2">
                          {project.bullets?.map((bullet: string, bIdx: number) => (
                            <textarea key={bIdx} className="w-full h-16 bg-bg-surface border border-border-default rounded-md px-3 py-2 text-sm text-text-primary" value={bullet || ""} onChange={(e) => { const newP = [...resumeData.projects]; newP[idx].bullets[bIdx] = e.target.value; setResumeData({...resumeData, projects: newP}); }} />
                          ))}
                        </div>
                      </div>
                    ))}
                    {(!resumeData?.projects || resumeData.projects.length === 0) && <p className="text-xs italic text-text-tertiary">No projects.</p>}
                  </CollapsibleSection>

                  <CollapsibleSection title="Education">
                    {resumeData?.education?.map((edu: any, idx: number) => (
                      <div key={idx} className="space-y-3 mb-4 p-4 bg-bg-surface rounded-md border border-border-subtle">
                        <input className="w-full bg-bg-surface border border-border-default rounded-md px-3 py-2 text-sm font-bold text-text-primary" value={edu.institution || ""} placeholder="Institution Name" onChange={(e) => { const newEdu = [...resumeData.education]; newEdu[idx].institution = e.target.value; setResumeData({...resumeData, education: newEdu}); }} />
                        <input className="w-full bg-bg-surface border border-border-default rounded-md px-3 py-2 text-sm text-text-primary" value={edu.degree || ""} placeholder="Degree" onChange={(e) => { const newEdu = [...resumeData.education]; newEdu[idx].degree = e.target.value; setResumeData({...resumeData, education: newEdu}); }} />
                      </div>
                    ))}
                  </CollapsibleSection>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Live PDF Preview */}
          <div className={`${mobileView === "preview" ? "flex" : "hidden"} lg:flex w-full lg:w-[55%] bg-bg-base p-0 sm:p-6 lg:p-8 items-center justify-center relative shadow-inner flex-1 min-h-0 shrink-0`}>
            {loading ? (
              <div className="w-full h-full max-w-200 bg-white dark:bg-bg-surface rounded-xl shadow-lg border border-border-subtle flex flex-col items-center justify-center">
                <div className="w-64 h-8 bg-gray-200 dark:bg-border-subtle rounded animate-pulse mb-8" />
                <div className="w-4/5 h-4 bg-gray-100 dark:bg-bg-surface-elevated rounded animate-pulse mb-3" />
                <div className="w-3/5 h-4 bg-gray-100 dark:bg-bg-surface-elevated rounded animate-pulse mb-12" />
                
                <div className="w-full px-12 space-y-6">
                   <div className="w-32 h-6 bg-gray-200 dark:bg-border-subtle rounded animate-pulse" />
                   <div className="w-full h-24 bg-gray-100 dark:bg-bg-surface-elevated rounded animate-pulse" />
                   
                   <div className="w-32 h-6 bg-gray-200 dark:bg-border-subtle rounded animate-pulse mt-12" />
                   <div className="w-full h-16 bg-gray-100 dark:bg-bg-surface-elevated rounded animate-pulse" />
                   <div className="w-full h-16 bg-gray-100 dark:bg-bg-surface-elevated rounded animate-pulse" />
                </div>
              </div>
            ) : resumeData ? (
              <div className="w-full h-full max-w-225 rounded-xl overflow-hidden shadow-2xl border border-gray-300 dark:border-border-default bg-white relative group animate-in zoom-in-95 duration-300">
                <PDFViewer key={`${activeTemplate}-${selectedVersionIndex}`} width="100%" height="100%" className="border-none w-full h-full">
                  <PDFTemplate data={resumeData} template={activeTemplate} />
                </PDFViewer>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-bold pointer-events-none backdrop-blur-md">
                  Live Preview
                </div>
              </div>
            ) : (
               <div className="text-center text-text-tertiary font-bold">Failed to load preview</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
