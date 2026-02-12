"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/firebase";

const AUTH_ROUTES = ["/login", "/signup"];

export function useRequireAuth() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If user is loading, we don't do anything yet.
    if (isUserLoading) {
      return;
    }

    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    // If the user is not authenticated and is trying to access a protected route
    if (!user && !isAuthRoute) {
      router.push("/login");
    }

    // If the user is authenticated and is trying to access an auth route
    if (user && isAuthRoute) {
      router.push("/");
    }
  }, [user, isUserLoading, router, pathname]);

  // Return user state so the component can decide what to render.
  return { user, isUserLoading };
}
