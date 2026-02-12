'use server';
/**
 * @fileOverview A poultry diagnosis AI agent.
 *
 * - generatePoultryDiagnosis - A function that handles the poultry diagnosis process.
 * - GeneratePoultryDiagnosisInput - The input type for the generatePoultryDiagnosis function.
 * - GeneratePoultryDiagnosisOutput - The return type for the generatePoultryDiagnosis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GeneratePoultryDiagnosisOutputSchema } from '@/ai/schemas';

const GeneratePoultryDiagnosisInputSchema = z.object({
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of affected poultry, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  symptomDescription: z
    .string()
    .optional()
    .describe('A detailed description of the poultry symptoms.'),
});
export type GeneratePoultryDiagnosisInput = z.infer<
  typeof GeneratePoultryDiagnosisInputSchema
>;

export type GeneratePoultryDiagnosisOutput = z.infer<
  typeof GeneratePoultryDiagnosisOutputSchema
>;

export async function generatePoultryDiagnosis(
  input: GeneratePoultryDiagnosisInput
): Promise<GeneratePoultryDiagnosisOutput> {
  return generatePoultryDiagnosisFlow(input);
}

const poultryDiagnosisPrompt = ai.definePrompt({
  name: 'poultryDiagnosisPrompt',
  input: { schema: GeneratePoultryDiagnosisInputSchema },
  output: { schema: GeneratePoultryDiagnosisOutputSchema },
  prompt: `You are an expert poultry veterinarian. Your task is to analyze the provided information (image and/or text description) to diagnose potential diseases or issues in poultry and recommend next steps.

If an image is provided, use it as the primary source of visual information. If a symptom description is provided, use it to gather more details. If both are provided, integrate both pieces of information for a comprehensive diagnosis.

Based on the input, provide a clear diagnosis, your confidence level, identified issues, possible diseases, and actionable next steps.

---
{{#if photoDataUri}}
Photo of affected poultry: {{media url=photoDataUri}}
{{/if}}

{{#if symptomDescription}}
Symptom Description: {{{symptomDescription}}}
{{/if}}

---
Provide the output in JSON format, strictly adhering to the schema provided.
`,
});

const generatePoultryDiagnosisFlow = ai.defineFlow(
  {
    name: 'generatePoultryDiagnosisFlow',
    inputSchema: GeneratePoultryDiagnosisInputSchema,
    outputSchema: GeneratePoultryDiagnosisOutputSchema,
  },
  async (input) => {
    if (!input.photoDataUri && !input.symptomDescription) {
      throw new Error('Either photoDataUri or symptomDescription must be provided.');
    }

    const { output } = await poultryDiagnosisPrompt(input);
    return output!;
  }
);
