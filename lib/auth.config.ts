import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Providers added in full auth config
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard") || 
                            nextUrl.pathname.startsWith("/jobs") || 
                            nextUrl.pathname.startsWith("/settings") ||
                            nextUrl.pathname.startsWith("/analytics");
                            
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
         // Redirect to dashboard if already logged in and on home/login page
         if (nextUrl.pathname === "/" || nextUrl.pathname === "/login" || nextUrl.pathname === "/signup") {
            return Response.redirect(new URL("/dashboard", nextUrl));
         }
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
