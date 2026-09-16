'use server';

/**
 * @fileOverview Generates a student financial report using AI.
 *
 * - generateStudentReport - A function that generates a summary of student financial standing.
 * - GenerateStudentReportInput - The input type for the generateStudentReport function.
 * - GenerateStudentReportOutput - The return type for the generateStudentReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudentReportInputSchema = z.object({
  studentRecords: z.string().describe('A JSON string containing an array of student records. Each record should include student ID, name, branch, grade, fees, discounts and payment status.'),
});
export type GenerateStudentReportInput = z.infer<typeof GenerateStudentReportInputSchema>;

const GenerateStudentReportOutputSchema = z.object({
  report: z.string().describe('A summary of student financial standing, including overall financial health of the student body, total fees collected, outstanding balances, and any notable trends or issues.'),
});
export type GenerateStudentReportOutput = z.infer<typeof GenerateStudentReportOutputSchema>;

export async function generateStudentReport(input: GenerateStudentReportInput): Promise<GenerateStudentReportOutput> {
  return generateStudentReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudentReportPrompt',
  input: {schema: GenerateStudentReportInputSchema},
  output: {schema: GenerateStudentReportOutputSchema},
  prompt: `You are a financial analyst specializing in educational institutions.

You will receive student records data and will generate a summary report of the student body's financial standing. This should include the overall financial health, total fees collected, outstanding balances, and any notable trends or issues. Provide clear and concise insights.

Student Records:
{{{studentRecords}}}
`,
});

const generateStudentReportFlow = ai.defineFlow(
  {
    name: 'generateStudentReportFlow',
    inputSchema: GenerateStudentReportInputSchema,
    outputSchema: GenerateStudentReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
