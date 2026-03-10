import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { generateContent } from "@/lib/grok";
import { User } from "@/models/User";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // The user can optionally pass { forceRegenerate: true } to skip cache
    const body = await req.json().catch(() => ({}));
    const forceRegenerate = body?.forceRegenerate === true;

    const job = await Job.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Checking if we already have a cached cover letter
    if (!forceRegenerate && job.coverLetter && job.coverLetter.length > 50) {
      console.log(`Returning cached cover letter for job: ${job._id}`);
      return NextResponse.json({
        coverLetter: job.coverLetter,
        cached: true,
      });
    }

    // Need Job Description
    if (!job.jobDescription || job.jobDescription.trim().length < 50) {
      return NextResponse.json(
        { error: "Job description is too short to generate a custom cover letter." },
        { status: 400 }
      );
    }

    // Ensure we have a resume
    const user = await User.findById(session.user.id);
    const resumeText = user?.resumeText ?? "";

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: "No resume found. Please upload your resume in Settings." },
        { status: 400 }
      );
    }

    console.log(`Generating AI Cover Letter for job: ${job._id}`);

    const prompt = `
Write a professional, compelling cover letter for this job application.
Use only skills and experiences from the resume provided.

STRICT INSTRUCTIONS:
- Structure: 3 paragraphs formatting perfectly with line breaks.
- Para 1: Strong opening hook — lead with the most relevant experience, do NOT start with 'I am writing to apply'.
- Para 2: Specific achievements and skills that match the JD requirements. Use the "What's Strong" and "Success Strategy" context if provided.
- Para 3: Brief closing with enthusiasm and clear CTA.
- Tone: confident, specific, human — not corporate or generic.
- Length: 250-320 words maximum.
- Return ONLY the cover letter body text, no subject line, no placeholders like [Your Name], no JSON, no markdown formatting blocks. Just the plain text paragraphs separated by empty lines.

CONTEXT:
What's Strong in Candidate: ${job.whatsStrong || "Not specified."}
Candidate Success Strategy: ${job.successStrategy || "Not specified."}

RESUME:
${resumeText.slice(0, 3000)}

JOB DESCRIPTION:
${job.jobDescription.slice(0, 2000)}
`.trim();

    const rawLetter = await generateContent(prompt);

    // Clean up potential markdown code blocks returned automatically
    const cleanedLetter = rawLetter
      .replace(/^```[a-z]*\n/gi, "")
      .replace(/```$/g, "")
      .trim();

    // Save to DB
    job.coverLetter = cleanedLetter;
    await job.save();

    console.log(`AI Cover Letter generated for job: ${job._id}`);

    return NextResponse.json({
      coverLetter: cleanedLetter,
      cached: false,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Cover Letter Error:", error);
    return NextResponse.json(
      {
        error: msg.includes("quota")
          ? "AI quota exhausted for today."
          : "Cover letter generation failed. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
