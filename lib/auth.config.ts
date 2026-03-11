import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Providers added in full auth config
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Route protection is handled in middleware.ts
    // This callback is only used for API route protection
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
