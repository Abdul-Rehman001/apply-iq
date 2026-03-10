import { AddJobModal } from "@/components/jobs/AddJobModal";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { Board } from "@/components/board/Board";
import { Plus } from "lucide-react";

async function getJobs(userId: string) {
  await dbConnect();
  const jobs = await Job.find({ userId }).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(jobs));
}

export default async function JobsPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  // @ts-ignore
  const jobs = await getJobs(session.user.id);

  return (
    <div className="h-full flex flex-col space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">My Applications</h1>
           <p className="text-sm text-text-secondary mt-1">Manage and track your job search pipeline.</p>
        </div>
        <AddJobModal>
             <button className="flex items-center gap-2 h-10 px-6 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm rounded-xl transition-all shadow-md shadow-primary/20">
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Add Application
             </button>
        </AddJobModal>
      </div>

      <Board initialJobs={jobs} />
    </div>
  );
}
