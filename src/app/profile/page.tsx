'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { User as UserIcon } from 'lucide-react';

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

            <div className="border-t pt-6 flex justify-center">
              <Button variant="outline" onClick={handleSignOut}>
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
