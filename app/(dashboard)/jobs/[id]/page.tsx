import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { JobDetailClient } from "@/components/jobs/JobDetailClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

async function getJob(id: string, userId: string) {
  await dbConnect();
  const job = await Job.findOne({ _id: id, userId });
  if (!job) return null;
  return JSON.parse(JSON.stringify(job));
}

export default async function JobDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  // @ts-ignore
  const job = await getJob(params.id, session.user.id);

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
         <Link href="/jobs" className="flex items-center gap-1 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to Jobs
         </Link>
      </div>
      
      <JobDetailClient job={job} />
    </div>
  );
}
