'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusSquare } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function BottomNavBar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/new-diagnosis', label: 'New Diagnosis', icon: PlusSquare },
  ];

  // Do not show nav items on auth pages
  if (['/login', '/signup'].includes(pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border bg-background/80 p-2 shadow-lg backdrop-blur-sm md:hidden">
      <div className="flex items-center gap-2">
        {navItems.map((item) => (
          <Button
            key={item.href}
            asChild
            variant="ghost"
            size="icon"
            className={cn(
              'flex h-12 w-12 flex-col gap-1 rounded-full text-muted-foreground',
              pathname === item.href &&
                'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
            )}
          >
            <Link href={item.href}>
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
}
