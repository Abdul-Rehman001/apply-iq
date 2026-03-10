import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateContent } from "@/lib/grok";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const prompt = `
      Extract the following details from the job description text below and return ONLY a JSON object.
      Do not include markdown formatting like \`\`\`json.
      
      Fields to extract:
      - title (Job Title)
      - company (Company Name)
      - location (Location)
      - salaryMin (Minimum Salary as number, null if not found)
      - salaryMax (Maximum Salary as number, null if not found)
      
      Job Description:
      ${text.substring(0, 5000)} // Limit text length to avoid token limits
    `;

    const textResponse = await generateContent(prompt);
    
    // Clean up potential markdown formatting if model ignores instruction
    const cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const data = JSON.parse(cleanJson);

    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Extraction Error:", error);
    return NextResponse.json({ error: "Failed to extract data" }, { status: 500 });
  }
}
