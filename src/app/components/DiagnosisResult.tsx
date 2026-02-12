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
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [recommendations, setRecommendations] = React.useState<string[]>([]);
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    setIsRecsLoading(true);
    setRecommendations([]);
    try {
      const result = await getRecommendationsAction({ diagnosis: diagnosis.diagnosis });
      setRecommendations(result.recommendations);
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
          <Badge variant={getConfidenceVariant(diagnosis.confidenceLevel)} className="text-lg">
            {diagnosis.confidenceLevel}
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">
            This is an AI-generated assessment. Always consult with a qualified veterinarian for a definitive diagnosis.
          </p>
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
      
      <InfoCard icon={ListOrdered} title="Recommended Next Steps">
        {recommendations.length > 0 ? (
           <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
           {recommendations.map((step, i) => (
             <li key={i}>{step}</li>
           ))}
         </ul>
        ) : (
          <>
            <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
              {diagnosis.recommendedNextSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
            <div className="mt-4">
              <Button onClick={handleGetRecommendations} disabled={isRecsLoading}>
                {isRecsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
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
