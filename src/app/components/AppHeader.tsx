"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusSquare, LayoutDashboard } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { PoultrySenseLogo } from "./PoultrySenseLogo";

export function AppHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/new-diagnosis", label: "New Diagnosis", icon: PlusSquare },
  ];

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-6">
        <Link href="/" aria-label="Home">
          <PoultrySenseLogo />
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(
                "text-muted-foreground transition-colors",
                pathname === item.href && "font-semibold text-primary"
              )}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Mobile Nav */}
        <nav className="flex md:hidden items-center">
          {navItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              size="icon"
              className={cn(
                "text-muted-foreground",
                pathname === item.href && "text-primary"
              )}
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
