import type { GeneratePoultryDiagnosisOutput } from "@/ai/flows/generate-poultry-diagnosis";

export interface Diagnosis extends GeneratePoultryDiagnosisOutput {
  id: string;
  timestamp: string;
  photoDataUri?: string;
  audioDataUri?: string;
  symptomDescription?: string;
}
