import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { Job } from "@/models/Job";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure only admins can access this, or hardcode the specific super-admin email
    if (session.user.role !== "admin" && session.user.email !== "abdulrehman7619931243@gmail.com") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    await dbConnect();

    // 1. Overall System Stats
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    
    // Aggregate global AI usage
    const globalUsage = await User.aggregate([
      {
        $group: {
          _id: null,
          totalAiTokens: { $sum: "$totalAiTokens" },
          totalAiCalls: { $sum: "$totalAiCalls" },
        }
      }
    ]);
    
    const totalTokens = globalUsage[0]?.totalAiTokens || 0;
    const totalCalls = globalUsage[0]?.totalAiCalls || 0;

    // Aggregate job-specific stats (e.g., how many jobs have been AI analyzed)
    const jobsAnalyzed = await Job.countDocuments({ aiAnalyzedAt: { $ne: null } });
    
    // Count total tailored resumes stored in history
    const historyStats = await Job.aggregate([
      {
        $project: {
          historyCount: { $size: { $ifNull: ["$resumeHistory", []] } }
        }
      },
      {
        $group: {
          _id: null,
          totalTailoredResumes: { $sum: "$historyCount" }
        }
      }
    ]);
    
    const totalTailoredResumes = historyStats[0]?.totalTailoredResumes || 0;

    // 2. Per-User Breakdown
    // Fetch users sorted by token usage descending
    const users = await User.find({}, 'name email role createdAt totalAiTokens totalAiCalls').sort({ totalAiTokens: -1 }).lean();
    
    // Get job count per user for the table
    const jobCounts = await Job.aggregate([
      {
        $group: {
          _id: "$userId",
          jobCount: { $sum: 1 }
        }
      }
    ]);
    
    const jobCountMap = new Map(jobCounts.map(jc => [jc._id.toString(), jc.jobCount]));

    const usersData = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      joinedAt: u.createdAt,
      totalTokens: u.totalAiTokens || 0,
      totalCalls: u.totalAiCalls || 0,
      jobCount: jobCountMap.get(u._id.toString()) || 0
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalJobs,
        jobsAnalyzed,
        totalTailoredResumes,
        totalTokens,
        totalCalls,
      },
      users: usersData,
    });
  } catch (error) {
    console.error("Admin Stats API Error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
