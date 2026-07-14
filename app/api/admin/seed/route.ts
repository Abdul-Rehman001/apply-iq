import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await dbConnect();

    // Check if the admin already exists
    const existingAdmin = await User.findOne({ email: "admin@applyiq.com" });
    
    if (existingAdmin) {
      return NextResponse.json({ 
        message: "Admin account already exists!", 
        email: "admin@applyiq.com" 
      });
    }

    // Create a secure hash for "admin123"
    const passwordHash = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "Super Admin",
      email: "admin@applyiq.com",
      passwordHash: passwordHash,
      role: "admin",
      provider: "credentials",
      completedOnboarding: true,
      totalAiTokens: 0,
      totalAiCalls: 0
    });

    return NextResponse.json({
      success: true,
      message: "Admin credentials successfully created!",
      credentials: {
        email: "admin@applyiq.com",
        password: "admin123"
      },
      note: "Please log in using the standard login page with these credentials."
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to seed admin:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
