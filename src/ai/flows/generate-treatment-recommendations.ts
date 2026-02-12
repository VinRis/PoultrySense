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
  diagnosis: z.string().describe("The main diagnosis text."),
  possibleDiseases: z.array(z.string()).describe("A list of possible diseases identified."),
  identifiedIssues: z.array(z.string()).describe("A list of specific issues or symptoms observed."),
  symptomDescription: z.string().optional().describe("The original user-provided symptom description.")
});
export type GenerateTreatmentRecommendationsInput = z.infer<typeof GenerateTreatmentRecommendationsInputSchema>;

const GenerateTreatmentRecommendationsOutputSchema = z.object({
  medicationSuggestions: z.array(z.object({
    name: z.string().describe("Name of the medication."),
    dosage: z.string().describe("Recommended dosage and administration instructions."),
    notes: z.string().optional().describe("Additional important notes or warnings about the medication."),
  })).describe("Specific medication suggestions. Can be empty if no medication is recommended."),
  managementAdvice: z.array(z.string()).describe("Advice on flock management, biosecurity, and environmental changes to improve health and prevent spread."),
  nutritionalSupport: z.array(z.string()).describe("Recommendations for dietary adjustments or supplements to support recovery."),
  followUpActions: z.array(z.string()).describe("Clear instructions on what to monitor, when to expect improvement, and what to do if the condition worsens.")
});
export type GenerateTreatmentRecommendationsOutput = z.infer<typeof GenerateTreatmentRecommendationsOutputSchema>;

export async function generateTreatmentRecommendations(input: GenerateTreatmentRecommendationsInput): Promise<GenerateTreatmentRecommendationsOutput> {
  return generateTreatmentRecommendationsFlow(input);
}

const generateTreatmentRecommendationsPrompt = ai.definePrompt({
  name: 'generateTreatmentRecommendationsPrompt',
  input: {schema: GenerateTreatmentRecommendationsInputSchema},
  output: {schema: GenerateTreatmentRecommendationsOutputSchema},
  prompt: `You are an expert poultry veterinarian providing a detailed and actionable treatment plan for a poultry farmer.
Based on the full diagnostic context below, generate a comprehensive treatment plan. The plan should be practical, easy to understand, and cover medication, management, nutrition, and follow-up.

- If suggesting medications, be specific about dosage and administration. If no medications are appropriate, return an empty array for 'medicationSuggestions'.
- Management advice should focus on practical changes the farmer can make to the environment or their processes.
- Nutritional support should include specific dietary changes or supplements.
- Follow-up actions should give the farmer a clear timeline and signs to watch for.

Full Diagnostic Context:
- Initial Diagnosis Summary: {{{diagnosis}}}
- Possible Diseases Identified: {{#each possibleDiseases}}- {{{this}}}{{/each}}
- Specific Symptoms Observed: {{#each identifiedIssues}}- {{{this}}}{{/each}}
{{#if symptomDescription}}- Original Symptom Description: {{{symptomDescription}}}{{/if}}
`,
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
