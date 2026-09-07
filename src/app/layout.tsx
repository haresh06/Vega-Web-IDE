import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "VEGA Learn & Lab — Embedded Systems Learning Platform",
  description: "An interactive learning and experimentation platform for VEGA processors and embedded systems. Learn, code, build, flash, and master embedded systems with VEGA ARIES v2.",
  keywords: ["VEGA", "embedded systems", "RISC-V", "THEJAS32", "ARIES v2", "microcontroller", "learning platform", "IoT"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://api.fontshare.com/v2/css?f[]=general-sans@300,400,500,600,700,800,900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider>
          <AppShell>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
