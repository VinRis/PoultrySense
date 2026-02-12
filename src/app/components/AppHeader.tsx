"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PoultrySenseLogo } from "./PoultrySenseLogo";
import { UserNav } from "./UserNav";

export function AppHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/new-diagnosis", label: "New Diagnosis" },
  ];

  // Do not show nav items on auth pages
  const showNav = !["/login", "/signup"].includes(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-6">
        <Link href="/" aria-label="Home">
          <PoultrySenseLogo />
        </Link>
        {showNav && (
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
        )}
      </div>

      <div className="flex items-center gap-2">
        <UserNav />
      </div>
    </header>
  );
}
