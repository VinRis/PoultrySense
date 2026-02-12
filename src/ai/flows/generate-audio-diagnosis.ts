'use server';
/**
 * @fileOverview A poultry respiratory diagnosis AI agent using audio.
 *
 * - generateAudioDiagnosis - A function that handles the poultry respiratory diagnosis process.
 * - GenerateAudioDiagnosisInput - The input type for the generateAudioDiagnosis function.
 * - GeneratePoultryDiagnosisOutput - The return type from generate-poultry-diagnosis is reused.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GeneratePoultryDiagnosisOutputSchema } from '@/ai/schemas';

const GenerateAudioDiagnosisInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio recording of poultry sounds, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateAudioDiagnosisInput = z.infer<
  typeof GenerateAudioDiagnosisInputSchema
>;

export async function generateAudioDiagnosis(
  input: GenerateAudioDiagnosisInput
): Promise<z.infer<typeof GeneratePoultryDiagnosisOutputSchema>> {
  return generateAudioDiagnosisFlow(input);
}

const poultryAudioDiagnosisPrompt = ai.definePrompt({
  name: 'poultryAudioDiagnosisPrompt',
  input: { schema: GenerateAudioDiagnosisInputSchema },
  output: { schema: GeneratePoultryDiagnosisOutputSchema },
  prompt: `You are an expert poultry veterinarian specializing in diagnosing respiratory illnesses from audio recordings.
Your task is to analyze the provided audio file to identify potential respiratory diseases in poultry.

Listen carefully for sounds like coughing, sneezing, gurgling, rattling, or labored breathing.

Based on the audio, provide a clear diagnosis, your confidence level, a list of specific sounds you identified (as 'identifiedIssues'), potential diseases, and recommended next steps.

---
Audio of poultry sounds: {{media url=audioDataUri}}
---

Provide the output in JSON format, strictly adhering to the schema provided. The 'identifiedIssues' field should contain the specific sounds you heard (e.g., "Persistent coughing", "Wheezing sound on exhale").
`,
});

const generateAudioDiagnosisFlow = ai.defineFlow(
  {
    name: 'generateAudioDiagnosisFlow',
    inputSchema: GenerateAudioDiagnosisInputSchema,
    outputSchema: GeneratePoultryDiagnosisOutputSchema,
  },
  async (input) => {
    const { output } = await poultryAudioDiagnosisPrompt(input);
    if (!output) {
      throw new Error('Failed to generate audio diagnosis.');
    }
    return output;
  }
);
