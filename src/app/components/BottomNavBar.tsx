'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusSquare, User } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function BottomNavBar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/new-diagnosis', label: 'New Diagnosis', icon: PlusSquare },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  // Do not show nav items on auth pages
  if (['/login', '/signup'].includes(pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border bg-background/80 p-1 shadow-lg backdrop-blur-sm md:hidden">
      <div className="flex items-center gap-1">
        {navItems.map((item) => (
          <Button
            key={item.href}
            asChild
            variant="ghost"
            className={cn(
              'flex h-12 w-16 flex-col items-center justify-center gap-0.5 rounded-xl p-1 text-muted-foreground',
              pathname === item.href &&
                'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
            )}
          >
            <Link href={item.href}>
              <item.icon className="h-4 w-4" />
              <span className="text-center text-[10px] leading-tight">
                {item.label}
              </span>
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
}
