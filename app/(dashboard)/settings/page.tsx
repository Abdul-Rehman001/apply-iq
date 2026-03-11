import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { ResumeTextEditor } from "@/components/resume/ResumeTextEditor";
import { ResumeUpload } from "@/components/resume/ResumeUpload";
import { ResumeBanner } from "@/components/settings/ResumeBanner";
import { ProfileForm } from "@/components/settings/ProfileForm";
import {
  Settings as SettingsIcon,
  CreditCard,
  Bell,
  CloudUpload
} from "lucide-react";

async function getUser(userId: string) {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) return null;
  return JSON.parse(JSON.stringify(user));
}

export default async function SettingsPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  // @ts-ignore
  const user = await getUser(session.user.id);

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Account Settings</h1>
        <p className="text-text-secondary mt-1 font-medium">
          Manage your personal information, resume data, and subscription details.
        </p>
      </div>

      {/* Resume banner — shows if no resume, dismissible via localStorage */}
      {(!user?.resumeText || user.resumeText.length < 50) && <ResumeBanner />}

      <div className="space-y-12">
        {/* Profile Information */}
        <ProfileForm user={user} />
        <section>
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-4">
            <CloudUpload className="w-4 h-4 text-primary" />
            Resume & AI Context
          </h2>
          <div className="space-y-6">
             <div className="border border-border-default border-dashed bg-bg-surface p-8 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-bg-surface-elevated transition-colors">
                <CloudUpload className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-sm font-bold text-text-primary mb-1">Upload your latest Resume</h3>
                <p className="text-xs text-text-tertiary mb-6">PDF, DOCX up to 10MB</p>
                <div className="w-full max-w-sm">
                   <ResumeUpload initialUrl={user?.resumeUrl} />
                </div>
             </div>

             <div className="bg-bg-surface border border-border-subtle p-6 rounded-2xl">
                <div className="mb-4">
                   <h3 className="text-sm font-bold text-white">AI Personal Pitch</h3>
                   <p className="text-xs text-text-secondary mt-1">This context helps our AI tailor your cover letters and match formatting.</p>
                </div>
                <div className="min-h-[150px]">
                   <ResumeTextEditor initialText={user?.resumeText} />
                </div>
             </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-primary" />
            Notifications
          </h2>
          <div className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden">
             
             <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                <div>
                   <h3 className="text-sm font-bold text-white">Application Updates</h3>
                   <p className="text-xs text-text-secondary mt-0.5">Get notified when a company views your application.</p>
                </div>
                <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
             </div>

             <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                <div>
                   <h3 className="text-sm font-bold text-white">New Job Matches</h3>
                   <p className="text-xs text-text-secondary mt-0.5">Weekly digest of roles that fit your profile.</p>
                </div>
                <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
             </div>

             <div className="flex items-center justify-between p-6">
                <div>
                   <h3 className="text-sm font-bold text-white">AI Strategy Tips</h3>
                   <p className="text-xs text-text-secondary mt-0.5">Tips on how to improve your AI-generated cover letters.</p>
                </div>
                <div className="w-11 h-6 bg-border-strong rounded-full relative cursor-pointer">
                   <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
             </div>
             
          </div>
        </section>

      </div>
    </div>
  );
}

