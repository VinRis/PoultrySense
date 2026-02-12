"use client";
import { Loader2 } from "lucide-react";

export function FullScreenLoader() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
