"use client";

import * as React from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Stethoscope,
  Sparkles,
  ListChecks,
  FlaskConical,
  ListOrdered,
  Loader2,
  Download,
  Syringe,
  ClipboardList,
  Pill,
  Activity,
  AlertTriangle,
} from "lucide-react";

import type { Diagnosis } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRecommendationsAction } from "../actions";
import type { GenerateTreatmentRecommendationsOutput } from "@/ai/flows/generate-treatment-recommendations";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ConfidenceVariant = "default" | "secondary" | "destructive";

const getConfidenceVariant = (
  level: "High" | "Medium" | "Low"
): ConfidenceVariant => {
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

interface InfoCardProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, title, children }) => (
  <Card>
    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
      <div className="bg-primary/10 text-primary p-2 rounded-lg">
        <Icon className="h-6 w-6" />
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

interface DiagnosisResultProps {
  diagnosis: Diagnosis;
}

export function DiagnosisResult({ diagnosis }: DiagnosisResultProps) {
  const [isRecsLoading, setIsRecsLoading] = React.useState(false);
  const [detailedPlan, setDetailedPlan] =
    React.useState<GenerateTreatmentRecommendationsOutput | null>(null);
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    setIsRecsLoading(true);
    setDetailedPlan(null);
    try {
      const result = await getRecommendationsAction({
        diagnosis: diagnosis.diagnosis,
        possibleDiseases: diagnosis.possibleDiseases,
        identifiedIssues: diagnosis.identifiedIssues,
        symptomDescription: diagnosis.symptomDescription,
      });
      setDetailedPlan(result);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      toast({
        variant: "destructive",
        title: "Failed to load recommendations",
        description: "Please try again later.",
      });
    } finally {
      setIsRecsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Diagnosis Report</CardTitle>
          <CardDescription>
            Generated on {format(new Date(diagnosis.timestamp), "PPP p")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {diagnosis.photoDataUri && (
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative h-64 w-full rounded-lg overflow-hidden cursor-pointer">
                  <Image
                    src={diagnosis.photoDataUri}
                    alt="Submitted poultry"
                    fill
                    className="object-contain"
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Submitted Image</DialogTitle>
                </DialogHeader>
                <div className="relative h-[70vh] w-full">
                  <Image
                    src={diagnosis.photoDataUri}
                    alt="Submitted poultry"
                    fill
                    className="object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
          {diagnosis.symptomDescription && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Symptom Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {diagnosis.symptomDescription}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <InfoCard icon={Stethoscope} title="AI Diagnosis">
          <p className="text-muted-foreground">{diagnosis.diagnosis}</p>
        </InfoCard>

        <InfoCard icon={Sparkles} title="Confidence Level">
          <Badge
            variant={getConfidenceVariant(diagnosis.confidenceLevel)}
            className="text-lg"
          >
            {diagnosis.confidenceLevel}
          </Badge>
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Disclaimer</AlertTitle>
            <AlertDescription>
              This is an AI-generated assessment. Always consult with a qualified
              veterinarian for a definitive diagnosis.
            </AlertDescription>
          </Alert>
        </InfoCard>
      </div>

      <InfoCard icon={ListChecks} title="Identified Issues">
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          {diagnosis.identifiedIssues.map((issue, i) => (
            <li key={i}>{issue}</li>
          ))}
        </ul>
      </InfoCard>

      <InfoCard icon={FlaskConical} title="Possible Diseases">
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          {diagnosis.possibleDiseases.map((disease, i) => (
            <li key={i}>{disease}</li>
          ))}
        </ul>
      </InfoCard>

      <InfoCard
        icon={ListOrdered}
        title={
          detailedPlan ? "Detailed Treatment Plan" : "Recommended Next Steps"
        }
      >
        {detailedPlan ? (
          <div className="space-y-6">
            {detailedPlan.medicationSuggestions &&
              detailedPlan.medicationSuggestions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                    <Syringe className="h-5 w-5" />
                    Medication Suggestions
                  </h3>
                  <div className="space-y-3">
                    {detailedPlan.medicationSuggestions.map((med, i) => (
                      <div
                        key={i}
                        className="p-3 bg-muted/50 rounded-lg border"
                      >
                        <h4 className="font-semibold">{med.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Dosage:</strong>{" "}
                          {med.dosage}
                        </p>
                        {med.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <strong className="text-foreground">Notes:</strong>{" "}
                            {med.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {detailedPlan.managementAdvice &&
              detailedPlan.managementAdvice.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                    <ClipboardList className="h-5 w-5" />
                    Management Advice
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
                    {detailedPlan.managementAdvice.map((advice, i) => (
                      <li key={i}>{advice}</li>
                    ))}
                  </ul>
                </div>
              )}

            {detailedPlan.nutritionalSupport &&
              detailedPlan.nutritionalSupport.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                    <Pill className="h-5 w-5" />
                    Nutritional Support
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
                    {detailedPlan.nutritionalSupport.map((support, i) => (
                      <li key={i}>{support}</li>
                    ))}
                  </ul>
                </div>
              )}

            {detailedPlan.followUpActions &&
              detailedPlan.followUpActions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                    <Activity className="h-5 w-5" />
                    Follow-up Actions
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
                    {detailedPlan.followUpActions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        ) : (
          <>
            <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
              {diagnosis.recommendedNextSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
            <div className="mt-4">
              <Button
                onClick={handleGetRecommendations}
                disabled={isRecsLoading}
              >
                {isRecsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Detailed Plan...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Get Detailed Treatment Plan
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </InfoCard>
    </div>
  );
}
