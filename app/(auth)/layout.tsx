"use client";

import { Zap, CheckCircle2 } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const bgImage = isLoginPage ? "/login.jpg" : "/register.jpg";

  return (
    <div className="min-h-screen grid lg:grid-cols-[60%_40%] bg-bg-base transition-all">
       {/* Left Side - Hero */}
       <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 scale-105 hover:scale-100"
            style={{ backgroundImage: `url('${bgImage}')` }}
          />
          {/* Balanced Overlay for readability */}
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent lg:bg-gradient-to-r lg:from-black/60 lg:to-transparent"></div>

          <div className="relative z-10 flex items-center gap-2.5">
             <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
             </div>
             <span className="text-xl font-bold tracking-tight text-white">
               ApplyIQ
             </span>
          </div>

          <div className="relative z-10 max-w-lg mb-12 font-sans">
             <h2 className="text-5xl font-extrabold text-white leading-tight mb-8 tracking-tight">
               Track smarter.<br/>
               <span className="text-white/95">Land faster!</span>
             </h2>
             <ul className="space-y-6">
                {[
                  { title: "ATS Compatibility Score", desc: "Instantly see how your resume matches any job description." },
                  { title: "AI-Powered Career Coach", desc: "Get specific, actionable advice to bridge your skill gaps." },
                  { title: "Smart Kanban Tracking", desc: "Manage your entire application funnel with visual simplicity." }
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-4 group">
                     <div className="mt-1.5 shrink-0">
                        <CheckCircle2 className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-white/60 leading-relaxed max-w-sm">
                          {feature.desc}
                        </p>
                     </div>
                  </li>
                ))}
             </ul>
          </div>

          <div className="relative z-10 text-xs text-white/30 font-medium">
             &copy; 2026 ApplyIQ Inc. All rights reserved.
          </div>
       </div>

       {/* Right Side - Form */}
       <div className="flex flex-col items-center justify-center p-8 bg-bg-base border-l border-border-subtle/50 relative z-20">
          <div className="w-full max-w-[400px]">
             {children}
          </div>
       </div>
    </div>
  )
}
