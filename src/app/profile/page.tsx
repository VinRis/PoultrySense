'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import {
  User as UserIcon,
  Store,
  Phone,
  MessageCircle,
  Heart,
} from 'lucide-react';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { useToast } from '@/hooks/use-toast';
import { FullScreenLoader } from '@/app/components/FullScreenLoader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function ProfilePage() {
  const { user, isUserLoading } = useRequireAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await getAuth().signOut();
      toast({ title: 'Signed out successfully.' });
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to sign out',
        description: 'Please try again.',
      });
    }
  };

  if (isUserLoading || !user) {
    return <FullScreenLoader />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Manage your account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={user.photoURL ?? ''}
                  alt={user.displayName ?? ''}
                />
                <AvatarFallback className="text-muted-foreground text-3xl">
                  <UserIcon className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-xl font-semibold">
                  {user.displayName || 'User'}
                </p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-medium text-center text-foreground">
                Contact & Support
              </h3>
              <div className="space-y-2">
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start text-base"
                >
                  <a
                    href="https://selar.com/kpf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Store className="mr-3 h-5 w-5 text-primary" />
                    Visit our Online Store
                  </a>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start text-base"
                >
                  <a href="tel:+254732364559">
                    <Phone className="mr-3 h-5 w-5 text-primary" />
                    Call Us: +254732364559
                  </a>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start text-base"
                >
                  <a
                    href="https://www.facebook.com/KienyejiPoultryFarmers"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FacebookIcon className="mr-3 h-5 w-5 text-primary" />
                    Follow us on Facebook
                  </a>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start text-base"
                >
                  <a
                    href="https://wa.me/254732364559"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-3 h-5 w-5 text-primary" />
                    Chat on WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            <div className="border-t pt-6 flex justify-center">
              <Button variant="outline" onClick={handleSignOut}>
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="text-center mt-8 text-sm text-muted-foreground">
          Made with{' '}
          <Heart
            className="inline h-4 w-4 text-red-500"
            fill="currentColor"
          />{' '}
          by{' '}
          <a
            href="https://www.facebook.com/KienyejiPoultryFarmers"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            KPF
          </a>
        </div>
      </div>
    </div>
  );
}
