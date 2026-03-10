import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("No file received");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "applyiq_resumes" },
        (error, result) => {
           if (error) reject(error);
           else resolve(result);
        }
      ).end(buffer);
    });

    // Update User profile
    await dbConnect();
    // @ts-ignore
    const user = await User.findById(session.user.id);
    if (user) {
       user.resumeUrl = uploadResult.secure_url;
       // We would ideally process text extraction here or via a webhook
       // For now, we just save the URL
       await user.save();
    }

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
