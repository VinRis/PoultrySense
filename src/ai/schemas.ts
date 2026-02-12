import {z} from 'genkit';

export const GeneratePoultryDiagnosisOutputSchema = z.object({
  diagnosis: z.string().describe("The AI's detailed diagnosis of the poultry's condition."),
  confidenceLevel: z
    .enum(['High', 'Medium', 'Low'])
    .describe("The AI's confidence level in the diagnosis."),
  identifiedIssues: z
    .array(z.string())
    .describe('A list of specific issues or symptoms identified.'),
  possibleDiseases: z
    .array(z.string())
    .describe('A list of potential diseases or conditions matching the symptoms.'),
  recommendedNextSteps: z
    .array(z.string())
    .describe('Actionable next steps and treatment recommendations.'),
});
