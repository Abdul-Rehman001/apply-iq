import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { Job } from "@/models/Job";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    await dbConnect();

    // If resume text is being updated, invalidate ALL cached AI analyses
    // so the next scan/analysis uses the fresh resume data
    if (body.resumeText !== undefined) {
      // Clear the user's ATS cache (score, details, timestamp)
      body.atsScore = null;
      body.atsLastChecked = null;
      body.atsDetails = null;

      // Mark ALL job analyses for this user as stale
      // by clearing aiAnalyzedAt — next "Analyze" click will re-run AI
      await Job.updateMany(
        { userId: session.user.id },
        {
          $set: {
            matchScore: null,
            whatsStrong: "",
            biggestGap: "",
            actionToday: "",
            successStrategy: "",
            missingKeywords: [],
            interviewRisk: "medium",
            aiCoachTips: [],
            aiAnalyzedAt: null,
            aiResumeFingerprint: null,
          },
        }
      );

      console.log("Resume updated — cleared all cached AI analyses");
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: body },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
