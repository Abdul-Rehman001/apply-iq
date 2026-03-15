import type { Metadata } from "next";
import "./globals.css";
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Satisfy&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-outfit: 'Outfit', sans-serif;
          }
          body {
            font-family: 'Outfit', sans-serif !important;
            letter-spacing: 0.015em !important;
          }
        `}} />
      </head>
      <body className="antialiased bg-bg-base text-text-primary min-h-screen">
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <Toaster
              position="top-center"
              toastOptions={{
                className: "!bg-bg-surface !text-text-primary !border !border-border-subtle !shadow-lg !rounded-xl !text-sm !font-medium",
                style: {
                  fontFamily: "'Outfit', sans-serif",
                  letterSpacing: '0.015em',
                },
                duration: 3000,
              }}
            />
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
