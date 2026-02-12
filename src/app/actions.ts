"use server";

import { generatePoultryDiagnosis } from "@/ai/flows/generate-poultry-diagnosis";
import { generateTreatmentRecommendations } from "@/ai/flows/generate-treatment-recommendations";
import { z } from "zod";

const DiagnosePoultryInput = z.object({
  photoDataUri: z.string().optional(),
  symptomDescription: z.string().optional(),
});

export async function diagnosePoultryAction(
  input: z.infer<typeof DiagnosePoultryInput>
) {
  const result = await generatePoultryDiagnosis(input);
  return result;
}

const GetRecommendationsInput = z.object({
  diagnosis: z.string(),
  possibleDiseases: z.array(z.string()),
  identifiedIssues: z.array(z.string()),
  symptomDescription: z.string().optional(),
});

export async function getRecommendationsAction(
  input: z.infer<typeof GetRecommendationsInput>
) {
  const result = await generateTreatmentRecommendations(input);
  return result;
}
