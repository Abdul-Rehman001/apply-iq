import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/");
  }

  // Strictly enforce admin role or the specific master admin email
  const isAuthorized = session.user.role === "admin" || session.user.email === "admin@applyiq.com";
  
  if (!isAuthorized) {
    redirect("/dashboard"); // Kick normal users back to their dashboard
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {children}
      </div>
    </div>
  );
}