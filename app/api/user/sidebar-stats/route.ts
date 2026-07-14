import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { User } from "@/models/User";
import { IUser } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const userId = session.user.id;
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const [user, unanalyzedCount, followUpDueCount] = await Promise.all([
    User.findById(userId).select("resumeText").lean(),
    Job.countDocuments({ userId, matchScore: null }),
    Job.countDocuments({ userId, followUpDate: { $lte: today } }),
  ]);

  const hasResume = !!(user as IUser)?.resumeText && ((user as IUser)?.resumeText?.length ?? 0) > 50;

  return NextResponse.json({ unanalyzedCount, hasResume, followUpDueCount });
}
