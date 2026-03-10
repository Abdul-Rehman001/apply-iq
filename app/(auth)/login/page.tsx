import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - ApplyIQ",
};

export default function LoginPage() {
  return <LoginForm />;
}
