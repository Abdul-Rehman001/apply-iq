import { SignupForm } from "@/components/auth/SignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - ApplyIQ",
};

export default function SignupPage() {
  return <SignupForm />;
}
