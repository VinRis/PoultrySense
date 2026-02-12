'use client';

import * as React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  LayoutDashboard,
  FileText,
  ImageIcon,
  Mic,
  Plus,
} from 'lucide-react';
import { collection, query, orderBy } from 'firebase/firestore';

import {
  useCollection,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import { useRequireAuth } from '@/hooks/use-require-auth';
import type { Diagnosis } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { DiagnosisResult } from '@/app/components/DiagnosisResult';
import { Badge } from '@/components/ui/badge';
import { DashboardCharts } from '@/app/components/DashboardCharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FullScreenLoader } from './components/FullScreenLoader';

export default function DashboardPage() {
  const { user, isUserLoading: isAuthLoading } = useRequireAuth();
  const firestore = useFirestore();

  const diagnosesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, `users/${user.uid}/diagnoses`),
      orderBy('timestamp', 'desc')
    );
  }, [user, firestore]);

  const { data: history, isLoading: isHistoryLoading } =
    useCollection<Diagnosis>(diagnosesQuery);

  const getConfidenceVariant = (level: 'High' | 'Medium' | 'Low') => {
    switch (level) {
      case 'High':
        return 'default';
      case 'Medium':
        return 'secondary';
      case 'Low':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getInputTypeIcon = (diagnosis: Diagnosis) => {
    if (diagnosis.photoDataUri) return <ImageIcon className="h-4 w-4" />;
    if (diagnosis.audioDataUri) return <Mic className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  if (isAuthLoading || !user || (diagnosesQuery && isHistoryLoading)) {
    return <FullScreenLoader />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 hidden sm:block" />
              Analytics Dashboard
            </h1>
            <p className="mt-2 text-base sm:text-lg text-muted-foreground">
              Review trends and past diagnostic reports for your account.
            </p>
          </div>
        </header>

        <DashboardCharts diagnoses={history || []} />

        {history && history.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Diagnosis Log</CardTitle>
              <CardDescription>
                Review individual diagnosis reports from your history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {history.map((diagnosis) => (
                  <AccordionItem value={diagnosis.id} key={diagnosis.id}>
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="text-left">
                          <h4 className="font-semibold text-sm sm:text-base">
                            {diagnosis.possibleDiseases[0] ||
                              'General Assessment'}
                          </h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {format(new Date(diagnosis.timestamp), 'PP p')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                          <Badge
                            variant={getConfidenceVariant(
                              diagnosis.confidenceLevel
                            )}
                            className="text-xs"
                          >
                            {diagnosis.confidenceLevel}
                          </Badge>
                          <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                            {getInputTypeIcon(diagnosis)}
                            <span className="text-sm">
                              {diagnosis.photoDataUri
                                ? 'Image'
                                : diagnosis.audioDataUri
                                ? 'Audio'
                                : 'Text'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <DiagnosisResult diagnosis={diagnosis} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
            <LayoutDashboard className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No History Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your past diagnoses will appear here once you run one.
            </p>
            <Button asChild className="mt-6">
              <Link href="/new-diagnosis">Start a New Diagnosis</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
