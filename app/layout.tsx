import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600", "700", "800"],
});

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "ApplyIQ - AI Job Tracker",
  description: "Track your job applications with AI coaching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} antialiased bg-bg-base text-text-primary min-h-screen`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster
              position="top-center"
              toastOptions={{
                className: "!bg-bg-surface !text-text-primary !border !border-border-subtle !shadow-lg !rounded-xl !text-sm !font-medium",
                duration: 3000,
              }}
            />
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
