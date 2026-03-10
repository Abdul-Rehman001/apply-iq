import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String }, // Optional for OAuth users
  provider: { type: String, enum: ["google", "credentials"], default: "credentials" },
  resumeUrl: { type: String },
  resumeText: { type: String }, // Extracted text for AI
  plan: { type: String, enum: ["free", "pro"], default: "free" },
}, { timestamps: true });

// Prevent overwrite on hot reload
export const User = mongoose.models.User || mongoose.model("User", UserSchema);
