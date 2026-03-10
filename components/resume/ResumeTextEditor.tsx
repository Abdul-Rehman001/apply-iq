"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface ResumeTextEditorProps {
  initialText?: string;
}

export function ResumeTextEditor({ initialText }: ResumeTextEditorProps) {
  const [text, setText] = useState(initialText || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text }),
      });
      if (!res.ok) throw new Error("Failed to save resume text");
      toast.success("Resume text updated for AI analysis!");
    } catch (error) {
      toast.error("Failed to update resume text");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-text-primary">Resume Text (for AI Coaching)</label>
        <p className="text-xs text-text-tertiary">
          Paste the text from your resume here. This is used by the AI to calculate your match score and provide tailored advice.
        </p>
        <textarea
          className="w-full h-64 p-4 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all resize-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your resume experience, skills, and about section here..."
        />
      </div>
      <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-50">
        {saving ? "Saving..." : "Save Resume Text"}
      </button>
    </div>
  );
}
