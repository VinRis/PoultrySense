"use client";

import * as React from "react";
import { format } from "date-fns";
import { History as HistoryIcon, Trash2 } from "lucide-react";

import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import type { Diagnosis } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DiagnosisResult } from "../components/DiagnosisResult";
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

export default function HistoryPage() {
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

  if (!isClient) {
    return null;
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
              Diagnosis History
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Review your past diagnostic reports.
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

        {history.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <HistoryIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No History Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your past diagnoses will appear here.
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {history.map((diagnosis) => (
              <AccordionItem value={diagnosis.id} key={diagnosis.id} className="border-b-0">
                <Card>
                  <AccordionTrigger className="p-4 hover:no-underline">
                    <div className="flex justify-between items-center w-full">
                      <div className="text-left">
                        <h4 className="font-semibold">
                          Report from {format(new Date(diagnosis.timestamp), "PPP")}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {diagnosis.possibleDiseases[0] || "General Assessment"}
                        </p>
                      </div>
                      <Badge variant={diagnosis.confidenceLevel === 'High' ? 'default' : diagnosis.confidenceLevel === 'Medium' ? 'secondary' : 'destructive'}>
                        {diagnosis.confidenceLevel} Confidence
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0">
                    <DiagnosisResult diagnosis={diagnosis} />
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </main>
  );
}
