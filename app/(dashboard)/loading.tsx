import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(166,137,250,0.15)]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
      <div className="text-center">
        <h2 className="text-sm font-extrabold text-text-primary">Loading...</h2>
        <p className="text-xs text-text-tertiary mt-1">Fetching your data</p>
      </div>
    </div>
  );
}
