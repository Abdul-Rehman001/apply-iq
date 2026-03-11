"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        toast.error("Invalid credentials");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const inputClass = "w-full h-12 bg-bg-surface-elevated border border-border-default rounded-xl px-4 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all";

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Sign in to your account</h1>
        <p className="text-sm text-text-secondary">
          Enter your details below to access your dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider" htmlFor="email">
            Email Address
          </label>
          <input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider" htmlFor="password">Password</label>
            <Link href="#" className="text-xs text-primary font-semibold hover:underline">Forgot?</Link>
          </div>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
        </div>
        <button type="submit" className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-50" disabled={loading || googleLoading}>
          {loading ? "Signing in..." : "Continue"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border-subtle" /></div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
          <span className="bg-bg-base px-3 text-text-tertiary">Or connect with</span>
        </div>
      </div>

      <button 
        className="w-full h-11 rounded-xl bg-bg-surface-elevated border border-border-default text-text-primary font-semibold text-sm hover:bg-bg-surface-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50" 
        onClick={handleGoogleSignIn}
        disabled={loading || googleLoading}
      >
        {googleLoading ? (
          <div className="w-4 h-4 border-2 border-text-tertiary border-t-text-primary rounded-full animate-spin"></div>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" className="opacity-60" />
          </svg>
        )}
        {googleLoading ? "Connecting..." : "Google"}
      </button>

      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
