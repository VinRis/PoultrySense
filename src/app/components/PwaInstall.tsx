'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

// Define the event type, as it's not standard in all TS lib versions.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstall() {
  const { toast, dismiss } = useToast();
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  const handleInstallClick = useCallback(async () => {
    if (!installPromptEvent) {
      return;
    }
    // Show the prompt
    installPromptEvent.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    // We can only use the prompt once, so clear it.
    setInstallPromptEvent(null);
  }, [installPromptEvent]);

  useEffect(() => {
    // Service Worker registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // PWA install prompt handler
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  useEffect(() => {
    if (installPromptEvent) {
      const { id } = toast({
        title: 'Install PoultrySense AI',
        description:
          'For a better experience, install the app on your device.',
        duration: Infinity,
        action: (
          <Button
            onClick={() => {
              handleInstallClick();
              dismiss(id);
            }}
          >
            <Download className="mr-2" />
            Install
          </Button>
        ),
      });
    }
  }, [installPromptEvent, toast, dismiss, handleInstallClick]);

  return null;
}
