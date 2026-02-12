'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusSquare, User } from 'lucide-react';
import { useState, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function BottomNavBar() {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/new-diagnosis', label: 'New Diagnosis', icon: PlusSquare },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  if (!isClient) {
    // Return null on the server to avoid hydration mismatch
    return null;
  }

  // Do not show nav items on auth pages
  if (['/login', '/signup'].includes(pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border bg-background/80 p-1 shadow-lg backdrop-blur-lg md:hidden">
      <div className="flex items-center gap-1">
        {navItems.map((item) => (
          <Button
            key={item.href}
            asChild
            variant="ghost"
            className={cn(
              'flex h-auto w-auto flex-col items-center justify-center gap-1 rounded-full px-4 py-2 text-muted-foreground transition-colors hover:bg-transparent hover:text-primary',
              pathname === item.href &&
                'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
            )}
          >
            <Link href={item.href}>
              <item.icon className="h-5 w-5" />
              <span className="text-center text-xs font-medium leading-none">
                {item.label}
              </span>
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
}
