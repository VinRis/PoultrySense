"use client";

import Link from "next/link";

import { useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "./ThemeToggle";

export function UserNav() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href="/login">Log In</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/signup">Sign Up</Link>
      </Button>
      <ThemeToggle />
    </div>
  );
}
