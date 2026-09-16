'use server';

/**
 * @fileOverview AI flow to generate specific departmental performance summaries.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DepartmentSummaryInputSchema = z.object({
  department: z.string().describe('The department to analyze (e.g., IT, HR, Finance, Operations).'),
  ticketCount: z.number().describe('Number of tickets for this department.'),
  avgResponseTime: z.number().describe('Average response time for this department.'),
  recentTickets: z.array(z.object({
    content: z.string(),
    severity: z.string(),
    status: z.string()
  })).describe('Sample of recent tickets for context.')
});

export type DepartmentSummaryInput = z.infer<typeof DepartmentSummaryInputSchema>;

const DepartmentSummaryOutputSchema = z.object({
  executiveSummary: z.string().describe('A 2-sentence executive summary of departmental health.'),
  topPainPoints: z.array(z.string()).describe('Top 3 recurring issues found in the sample.'),
  strategicPriority: z.string().describe('The #1 recommended action for this department manager.'),
  riskLevel: z.enum(['Low', 'Moderate', 'High', 'Critical']).describe('Current operational risk level.'),
});

export type DepartmentSummaryOutput = z.infer<typeof DepartmentSummaryOutputSchema>;

export async function generateDepartmentSummary(input: DepartmentSummaryInput): Promise<DepartmentSummaryOutput> {
  return generateDepartmentSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDepartmentSummaryPrompt',
  input: { schema: DepartmentSummaryInputSchema },
  output: { schema: DepartmentSummaryOutputSchema },
  prompt: `You are an Enterprise Performance Consultant. Analyze the following performance data for the {{{department}}} department.

DATA:
- Total Departmental Workload: {{{ticketCount}}} tickets
- Average Neural Latency: {{{avgResponseTime}}}s
- Recent Issues Sample:
  {{#each recentTickets}}
  * [{{severity}}]: "{{content}}" (Status: {{status}})
  {{/each}}

STRICT REQUIREMENTS:
1. Provide a concise executive summary.
2. Identify the top 3 specific pain points based on the ticket sample.
3. Recommend exactly one high-impact strategic priority.
4. Categorize the current risk level.

Tone: Professional, Data-Driven, Strategic.`,
});

const generateDepartmentSummaryFlow = ai.defineFlow(
  {
    name: 'generateDepartmentSummaryFlow',
    inputSchema: DepartmentSummaryInputSchema,
    outputSchema: DepartmentSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('AI failed to generate departmental summary.');
    return output;
  }
);
