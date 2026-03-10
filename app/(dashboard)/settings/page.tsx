import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { ResumeTextEditor } from "@/components/resume/ResumeTextEditor";
import { ResumeUpload } from "@/components/resume/ResumeUpload";
import { 
  User as UserIcon, 
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
    <div className="space-y-10 pb-20 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Account Settings</h1>
        <p className="text-text-secondary mt-1 font-medium">
          Manage your personal information, resume data, and subscription details.
        </p>
      </div>

      <div className="space-y-12">
        {/* Profile Information */}
        <section>
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-4">
            <UserIcon className="w-4 h-4 text-primary" />
            Profile Information
          </h2>
          <div className="bg-bg-surface border border-border-subtle p-6 rounded-2xl shadow-sm">
             <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative group">
                   {user?.image ? (
                     <img src={user.image} alt={user.name} className="w-24 h-24 rounded-full object-cover border-2 border-primary/50 shadow-[0_0_20px_rgba(166,137,250,0.2)]" />
                   ) : (
                     <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50 shadow-[0_0_20px_rgba(166,137,250,0.2)]">
                       <span className="text-3xl font-bold text-primary">{user?.name?.charAt(0) || "U"}</span>
                     </div>
                   )}
                   <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-bg-base border-2 border-bg-surface hover:bg-primary-hover transition-colors">
                      <span className="text-xs font-bold">âœŽ</span>
                   </button>
                </div>
                
                <div className="flex-1 w-full grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-text-tertiary">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue={user?.name || ""}
                        className="w-full bg-bg-surface-elevated border border-border-strong rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                        placeholder="e.g. Alex Johnson"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-text-tertiary">Email Address</label>
                      <input 
                        type="email" 
                        defaultValue={user?.email || ""}
                        disabled
                        className="w-full bg-bg-surface-elevated border border-border-strong rounded-xl px-4 py-3 text-sm text-text-secondary opacity-70 cursor-not-allowed"
                      />
                   </div>
                   <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-text-tertiary">Job Title / Role</label>
                      <input 
                        type="text" 
                        defaultValue="Senior Product Designer"
                        className="w-full bg-bg-surface-elevated border border-border-strong rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Resume & AI Context */}
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

