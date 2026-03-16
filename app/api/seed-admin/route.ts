import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await dbConnect();
    
    const adminEmail = "admin@gmail.com";
    const adminPassword = "Admin@123";
    
    // Check if exists
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      existing.role = "admin";
      existing.passwordHash = await bcrypt.hash(adminPassword, 10);
      await existing.save();
      return NextResponse.json({ message: "Admin account updated with requested credentials." });
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await User.create({
      email: adminEmail,
      name: "Platform Admin",
      passwordHash,
      role: "admin",
      provider: "credentials",
      completedOnboarding: true
    });

    return NextResponse.json({ message: "Admin account seeded successfully.", credentials: { email: adminEmail, password: adminPassword } });
  } catch (error) {
    console.error("Seed Error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
