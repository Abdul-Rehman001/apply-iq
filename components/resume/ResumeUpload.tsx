"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export function ResumeUpload({ initialUrl }: { initialUrl?: string }) {
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(initialUrl);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
       toast.error("File size too large (max 5MB)");
       return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
       const res = await fetch("/api/resume/upload", { method: "POST", body: formData });
       if (!res.ok) throw new Error("Upload failed");
       const data = await res.json();
       setResumeUrl(data.url);
       toast.success("Resume uploaded successfully");
    } catch (error) {
       toast.error("Failed to upload resume");
    } finally {
       setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface overflow-hidden">
      <div className="px-6 py-4 border-b border-border-subtle">
        <h3 className="text-lg font-bold text-text-primary">Your Resume</h3>
      </div>
      <div className="p-6">
         <div className="flex flex-col items-center justify-center border-2 border-dashed border-border-default rounded-xl p-8 bg-bg-subtle/30">
            {resumeUrl ? (
               <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/25">
                     <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                     <p className="font-semibold text-text-primary">Resume Uploaded</p>
                     <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
                        <FileText className="w-3 h-3" /> View File
                     </a>
                  </div>
                  <button className="mt-2 px-4 py-2 text-sm font-semibold rounded-xl border border-border-default bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors" disabled={uploading} onClick={() => document.getElementById('resume-upload')?.click()}>
                     Replace File
                  </button>
               </div>
            ) : (
               <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-bg-surface-elevated border border-border-default rounded-full flex items-center justify-center mx-auto">
                     <Upload className="w-6 h-6 text-text-tertiary" />
                  </div>
                  <div>
                     <p className="font-semibold text-text-primary">Upload your resume</p>
                     <p className="text-xs text-text-tertiary">PDF or DOCX up to 5MB</p>
                  </div>
                  <button className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm rounded-xl transition-all shadow-md shadow-primary/20" disabled={uploading} onClick={() => document.getElementById('resume-upload')?.click()}>
                     {uploading ? "Uploading..." : "Select File"}
                  </button>
               </div>
            )}
            <input id="resume-upload" type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={handleUpload} />
         </div>
      </div>
    </div>
  );
}
