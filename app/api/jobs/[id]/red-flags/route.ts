import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { generateContent } from "@/lib/grok";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    await dbConnect();

    const job = await Job.findOne({ _id: id, userId: session.user.id });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (!job.jobDescription || job.jobDescription.length < 50) {
      return NextResponse.json({ error: "Job description is too short to analyze" }, { status: 400 });
    }

    // Check cache
    if (job.redFlagAnalysis) {
      return NextResponse.json(job.redFlagAnalysis);
    }

    const prompt = `You are a senior career advisor and executive coach who helps candidates evaluate job opportunities critically before applying. Your expertise spans all industries.
Analyze this job description for genuine red flags (warning signs of toxic culture, bad management, or unrealistic expectations) and green flags.

STRICT RULES:
1. ANTI-HALLUCINATION: Do NOT invent red flags if the job description is well-written and standard.
2. INDUSTRY CONTEXT: What is a red flag in one industry (e.g., "fast-paced" in government) might be standard in another (e.g., startup). Evaluate based on general professional standards.
3. BE SPECIFIC: Quote the exact phrasing from the JD that triggered the flag.

JOB DESCRIPTION:
${job.jobDescription}

Return ONLY valid JSON:
{
  "overallRating": "<safe | caution | warning>",
  "summary": "<2 sentence honest assessment of this role>",
  "redFlags": [
    {
      "flag": "<specific text or pattern found>",
      "meaning": "<what this usually signals>",
      "severity": "<low | medium | high>"
    }
  ],
  "greenFlags": [
    {
      "flag": "<positive signal found>",
      "meaning": "<why this is a good sign>"
    }
  ],
  "salaryAssessment": "<fair | below market | above market | not disclosed>",
  "requirementsRealism": "<realistic | slightly inflated | unrealistic>",
  "workLifeBalance": "<good signals | neutral | concerning signals>",
  "topConcern": "<the single most important thing to investigate before accepting this role>"
}`;

    const responseText = await generateContent(prompt);
    
    // Clean JSON response
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```\n/, "").replace(/\n```$/, "");
    }
    
    const analysis = JSON.parse(cleanJson);
    
    // Save to DB
    job.redFlagAnalysis = analysis;
    await job.save();

    return NextResponse.json(analysis);

  } catch (error: unknown) {
    console.error("Red Flag API Error:", error);
    return NextResponse.json({ error: "Analysis failed. Try again." }, { status: 500 });
  }
}
