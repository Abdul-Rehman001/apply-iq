import { auth } from "@/lib/auth";
import { 
  Play, 
  Calendar,
  Trophy,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default async function AnalyticsPage() {
  const session = await auth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Analytics Overview</h1>
          <p className="text-text-secondary mt-1 font-medium">Track your application performance and conversion funnel</p>
        </div>
        <div className="flex items-center gap-3 bg-bg-surface border border-border-subtle rounded-xl p-1 shadow-sm">
           <button className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover transition-colors">
              <ChevronLeft className="w-5 h-5" />
           </button>
           <span className="text-sm font-bold text-text-primary px-2">October 2026</span>
           <button className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover transition-colors">
              <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-surface border border-border-subtle p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-border-default transition-all">
           <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                 <Play className="w-5 h-5 ml-1" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">+2.5%</span>
           </div>
           <p className="text-xs text-text-secondary font-medium tracking-wide mb-1">Response Rate</p>
           <h3 className="text-3xl font-extrabold text-text-primary">24.8%</h3>
        </div>

        <div className="bg-bg-surface border border-border-subtle p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-border-default transition-all">
           <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                 <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-text-secondary bg-bg-surface-elevated px-2 py-1 rounded-full">-1 day</span>
           </div>
           <p className="text-xs text-text-secondary font-medium tracking-wide mb-1">Time to Interview</p>
           <h3 className="text-3xl font-extrabold text-text-primary">12 Days</h3>
        </div>

        <div className="bg-bg-surface border border-border-subtle p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-border-default transition-all">
           <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400">
                 <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">+0.5%</span>
           </div>
           <p className="text-xs text-text-secondary font-medium tracking-wide mb-1">Offer Rate</p>
           <h3 className="text-3xl font-extrabold text-text-primary">4.2%</h3>
        </div>
      </div>

      {/* Application Funnel */}
      <div className="bg-bg-surface border border-border-subtle p-6 rounded-2xl">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-extrabold text-text-primary">Application Funnel</h3>
            <span className="text-xs font-bold text-text-tertiary tracking-widest uppercase">Last 30 Days</span>
         </div>
         
         <div className="relative pt-2 pb-6">
            <div className="h-14 w-full bg-border-subtle rounded-xl overflow-hidden flex relative">
               <div className="h-full bg-primary/40 border-r border-[#1a142e] flex items-center px-4 relative z-10" style={{width: "100%"}}>
                  <span className="text-xs font-bold text-text-primary drop-shadow-md">120 Saved</span>
               </div>
            </div>
            {/* Overlay layers mimicking funnel segments */}
            <div className="absolute top-2 left-0 h-14 bg-primary border-r border-[#1a142e] flex items-center px-4 z-20 transition-all rounded-l-xl" style={{width: "70%"}}>
               <span className="text-xs font-bold text-text-primary drop-shadow-md relative z-10">85 Applied</span>
               <div className="absolute right-[-10px] top-0 bottom-0 w-8 bg-gradient-to-r from-primary to-transparent z-0 opacity-50 skew-x-12" />
            </div>
            
            <div className="absolute top-2 left-0 h-14 bg-purple-400 border-r border-[#1a142e] flex items-center px-4 z-30 transition-all rounded-l-xl" style={{width: "25%"}}>
               <span className="text-xs font-bold text-[#13101d] drop-shadow-sm relative z-10">21 Interview</span>
               <div className="absolute right-[-10px] top-0 bottom-0 w-8 bg-gradient-to-r from-purple-400 to-transparent z-0 opacity-50 skew-x-12" />
            </div>

            <div className="absolute top-2 left-0 h-14 bg-white flex items-center px-4 z-40 transition-all rounded-l-xl" style={{width: "5%"}}>
               <span className="text-xs font-bold text-[#13101d] relative z-10">5 Offers</span>
            </div>
            
            <div className="flex justify-between mt-3 text-[10px] font-bold text-text-tertiary px-1 uppercase tracking-wider">
               <span>100%</span>
               <span className="absolute left-[35%]">70.8% CV Rate</span>
               <span className="absolute left-[70%]">24.7% Int. Rate</span>
               <span>5.8% Success</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Heatmap */}
        <div className="bg-bg-surface border border-border-subtle p-6 rounded-2xl flex flex-col justify-between">
           <h3 className="text-base font-extrabold text-text-primary mb-6">Weekly Activity</h3>
           <div className="flex-1 flex flex-col justify-end">
              <div className="flex items-end gap-2 h-40 border-b border-border-subtle pb-2 w-full justify-between">
                 <div className="w-[15%] bg-primary/20 rounded-t-lg h-[20%] relative group cursor-pointer hover:bg-primary/40 transition-colors"></div>
                 <div className="w-[15%] bg-primary/40 rounded-t-lg h-[40%] relative group cursor-pointer hover:bg-primary/60 transition-colors"></div>
                 <div className="w-[15%] bg-primary/60 rounded-t-lg h-[75%] relative group cursor-pointer hover:bg-primary/80 transition-colors"></div>
                 <div className="w-[15%] bg-primary rounded-t-lg h-[100%] relative group cursor-pointer shadow-[0_0_15px_rgba(166,137,250,0.3)]"></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold tracking-widest text-text-tertiary mt-2">
                 <span>W1</span><span>W2</span><span>W3</span><span>W4</span>
              </div>
           </div>
        </div>

        {/* Roles by Type */}
        <div className="bg-bg-surface border border-border-subtle p-6 rounded-2xl">
           <h3 className="text-base font-extrabold text-text-primary mb-6">Roles by Type</h3>
           <div className="space-y-6">
              <div>
                 <div className="flex justify-between text-xs font-bold text-text-primary mb-3">
                    <span>Full-time</span>
                    <span className="text-text-secondary">65%</span>
                 </div>
                 <div className="h-2.5 w-full bg-border-subtle rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full relative shadow-[0_0_10px_rgba(166,137,250,0.5)]" style={{width: "65%"}}></div>
                 </div>
              </div>
              
              <div>
                 <div className="flex justify-between text-xs font-bold text-text-primary mb-3">
                    <span>Contract</span>
                    <span className="text-text-secondary">20%</span>
                 </div>
                 <div className="h-2.5 w-full bg-border-subtle rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full" style={{width: "20%"}}></div>
                 </div>
              </div>

              <div>
                 <div className="flex justify-between text-xs font-bold text-text-primary mb-3">
                    <span>Remote</span>
                    <span className="text-text-secondary">15%</span>
                 </div>
                 <div className="h-2.5 w-full bg-border-subtle rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 rounded-full" style={{width: "15%"}}></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

