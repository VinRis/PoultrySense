import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { AppHeader } from "./components/AppHeader";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { BottomNavBar } from "./components/BottomNavBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PoultrySense AI",
  description: "A practical diagnostic app for poultry farmers.",
  themeColor: "#22c55e",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
          <FirebaseClientProvider>
            <div className="flex flex-col h-full">
              <AppHeader />
              <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
            </div>
            <Toaster />
            <BottomNavBar />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
