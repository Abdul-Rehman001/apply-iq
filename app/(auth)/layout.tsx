import { Zap, CheckCircle2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg-base">
       {/* Left Side - Hero */}
       <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#1a0d3a] via-[#120826] to-[#0d0618] p-12 text-white relative overflow-hidden">
          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-violet-500 rounded-full blur-[120px] opacity-15"></div>

          <div className="relative z-10 flex items-center gap-2.5">
             <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
             </div>
             <span className="text-xl font-bold tracking-tight text-white">
               ApplyIQ
             </span>
          </div>

          <div className="relative z-10 max-w-lg">
             <h2 className="text-5xl font-extrabold text-white leading-tight mb-8 tracking-tight">Track smarter.<br/>Land faster.</h2>
             <ul className="space-y-5">
                {[
                  "AI-powered job analysis and matching",
                  "Beautiful Kanban board for status tracking",
                  "Unified dashboard for your entire search"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/70 font-medium">
                     <div className="h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center border border-emerald-500/25">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                     </div>
                     {feature}
                  </li>
                ))}
             </ul>
          </div>

          <div className="relative z-10 text-xs text-white/25 font-medium">
             &copy; 2026 ApplyIQ Inc. All rights reserved.
          </div>
       </div>

       {/* Right Side - Form */}
       <div className="flex flex-col items-center justify-center p-8 bg-bg-base">
          <div className="w-full max-w-[400px] space-y-6">
             {children}
          </div>
       </div>
    </div>
  )
}
