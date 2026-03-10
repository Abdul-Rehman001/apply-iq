"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Plus, X } from "lucide-react";

export function AddJobModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "", company: "", jobUrl: "", location: "", salaryMin: "", salaryMax: "",
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
          salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create job");
      toast.success("Job added successfully");
      setOpen(false);
      setFormData({ title: "", company: "", jobUrl: "", location: "", salaryMin: "", salaryMax: "" });
      router.refresh();
    } catch (error) {
      toast.error("Failed to add job");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all";

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative z-10 w-full max-w-[560px] mx-4 bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-7 py-5 border-b border-border-subtle">
              <div>
                <h2 className="text-lg font-extrabold text-text-primary">Add New Job</h2>
                <p className="text-xs text-text-secondary mt-0.5">Track a new application in your pipeline</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-tertiary">Job Title *</label>
                  <input required className={inputClass} placeholder="e.g. Senior Frontend Engineer" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-tertiary">Company *</label>
                  <input required className={inputClass} placeholder="e.g. Google, Stripe" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-tertiary">Location</label>
                  <input className={inputClass} placeholder="e.g. Remote, NYC" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-tertiary">Job URL</label>
                  <input className={inputClass} placeholder="https://..." value={formData.jobUrl} onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-tertiary">Salary Min</label>
                  <input type="number" className={inputClass} placeholder="120000" value={formData.salaryMin} onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-tertiary">Salary Max</label>
                  <input type="number" className={inputClass} placeholder="150000" value={formData.salaryMax} onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })} />
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold text-text-secondary hover:text-text-primary px-4 py-2 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-50">
                  <Plus className="w-4 h-4" strokeWidth={3} />
                  {loading ? "Adding..." : "Add Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
