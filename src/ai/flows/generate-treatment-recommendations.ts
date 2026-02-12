'use server';
/**
 * @fileOverview A Genkit flow for generating actionable treatment recommendations based on a poultry diagnosis.
 *
 * - generateTreatmentRecommendations - A function that handles the generation of treatment recommendations.
 * - GenerateTreatmentRecommendationsInput - The input type for the generateTreatmentRecommendations function.
 * - GenerateTreatmentRecommendationsOutput - The return type for the generateTreatmentRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTreatmentRecommendationsInputSchema = z.object({
  diagnosis: z.string().describe('The AI diagnosis of the poultry ailment.'),
});
export type GenerateTreatmentRecommendationsInput = z.infer<typeof GenerateTreatmentRecommendationsInputSchema>;

const GenerateTreatmentRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('A list of actionable next steps and treatment recommendations.'),
});
export type GenerateTreatmentRecommendationsOutput = z.infer<typeof GenerateTreatmentRecommendationsOutputSchema>;

export async function generateTreatmentRecommendations(input: GenerateTreatmentRecommendationsInput): Promise<GenerateTreatmentRecommendationsOutput> {
  return generateTreatmentRecommendationsFlow(input);
}

const generateTreatmentRecommendationsPrompt = ai.definePrompt({
  name: 'generateTreatmentRecommendationsPrompt',
  input: {schema: GenerateTreatmentRecommendationsInputSchema},
  output: {schema: GenerateTreatmentRecommendationsOutputSchema},
  prompt: `You are an expert poultry veterinarian providing actionable advice.
Based on the following diagnosis, provide clear, concise, and actionable next steps and treatment recommendations for a poultry farmer.
The recommendations should be practical and easy to understand for a farmer.

Diagnosis: {{{diagnosis}}}`,
});

const generateTreatmentRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateTreatmentRecommendationsFlow',
    inputSchema: GenerateTreatmentRecommendationsInputSchema,
    outputSchema: GenerateTreatmentRecommendationsOutputSchema,
  },
  async (input) => {
    const {output} = await generateTreatmentRecommendationsPrompt(input);
    if (!output) {
      throw new Error('Failed to generate treatment recommendations.');
    }
    return output;
  }
);
