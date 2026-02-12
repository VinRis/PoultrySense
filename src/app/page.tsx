"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { LayoutDashboard, Trash2, FileText, Image as ImageIcon, Mic, Plus } from "lucide-react";

import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import type { Diagnosis } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DiagnosisResult } from "@/app/components/DiagnosisResult";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { DashboardCharts } from "@/app/components/DashboardCharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const [history, setHistory] = useLocalStorage<Diagnosis[]>(
    "diagnosisHistory",
    []
  );
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClearHistory = () => {
    setHistory([]);
  };

  const getConfidenceVariant = (level: "High" | "Medium" | "Low") => {
    switch (level) {
      case "High":
        return "default";
      case "Medium":
        return "secondary";
      case "Low":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getInputTypeIcon = (diagnosis: Diagnosis) => {
    if (diagnosis.photoDataUri) return <ImageIcon className="h-4 w-4" />;
    if (diagnosis.audioDataUri) return <Mic className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  if (!isClient) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-10 bg-muted rounded-md w-1/4 mb-4"></div>
          <div className="h-6 bg-muted rounded-md w-1/3 mb-8"></div>
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2 h-80 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
          <div className="h-40 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl flex items-center gap-3">
              <LayoutDashboard className="h-10 w-10 hidden sm:block" />
              Analytics Dashboard
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Review trends and past diagnostic reports.
            </p>
          </div>
          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="mt-4 sm:mt-0">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your diagnosis history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </header>

        <DashboardCharts diagnoses={history} />

        {history.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Diagnosis Log</CardTitle>
              <CardDescription>Review individual diagnosis reports from your history.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {history.map((diagnosis) => (
                  <AccordionItem value={diagnosis.id} key={diagnosis.id}>
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="text-left">
                          <h4 className="font-semibold">{diagnosis.possibleDiseases[0] || "General Assessment"}</h4>
                          <p className="text-sm text-muted-foreground">{format(new Date(diagnosis.timestamp), "PPP p")}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={getConfidenceVariant(diagnosis.confidenceLevel)}>
                            {diagnosis.confidenceLevel}
                          </Badge>
                          <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                            {getInputTypeIcon(diagnosis)}
                            <span>{diagnosis.photoDataUri ? 'Image' : diagnosis.audioDataUri ? 'Audio' : 'Text'}</span>
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
      <Link href="/new-diagnosis" className="fixed bottom-6 left-6 z-20">
        <Button size="icon" className="rounded-full h-16 w-16 shadow-lg">
          <Plus className="h-8 w-8" />
          <span className="sr-only">New Diagnosis</span>
        </Button>
      </Link>
    </div>
  );
}
