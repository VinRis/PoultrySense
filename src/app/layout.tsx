import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { AppHeader } from "./components/AppHeader";
import { PwaInstall } from "./components/PwaInstall";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PoultrySense AI",
  description: "A practical diagnostic app for poultry farmers.",
  manifest: "/manifest.json",
  themeColor: "#22c55e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-body antialiased h-full`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col h-full">
            <AppHeader />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
          <Toaster />
          <PwaInstall />
        </ThemeProvider>
      </body>
    </html>
  );
}
