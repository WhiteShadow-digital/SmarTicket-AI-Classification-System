'use server';
/**
 * @fileOverview AI flow to evaluate historical ticket data and generate comprehensive strategic weekly summary insights.
 * Enforces strict departmental keys for reliable dashboard population.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TicketSampleSchema = z.object({
  category: z.string(),
  content: z.string(),
});

const MetricSchema = z.object({
  totalTickets: z.number(),
  categoryDistribution: z.record(z.string(), z.number()),
  severityDistribution: z.record(z.string(), z.number()),
  avgResponseTime: z.number(),
  timeRange: z.string().describe('e.g., Last 7 Days'),
  recentTickets: z.array(TicketSampleSchema).describe('A sample of recent ticket contents to identify recurring issues.'),
});

const WeeklyInsightsOutputSchema = z.object({
  summary: z.string().describe('A 2-3 sentence strategic summary insight for the current period.'),
  trends: z.array(z.string()).describe('List of 3 positive trends.'),
  patterns: z.array(z.string()).describe('List of 3 recurring patterns.'),
  concerns: z.array(z.string()).describe('List of 3 critical operational issues.'),
  recommendations: z.array(z.string()).describe('List of 3 specific actionable strategic recommendations.'),
  recurringIssuesByDept: z.object({
    IT: z.array(z.string()).describe('Exactly 3 recurring IT issues.'),
    HR: z.array(z.string()).describe('Exactly 3 recurring HR issues.'),
    Finance: z.array(z.string()).describe('Exactly 3 recurring Finance issues.'),
    Operations: z.array(z.string()).describe('Exactly 3 recurring Operations issues.'),
  }).describe('Analysis of ticket samples mapped to these four specific departments.'),
  efficiencyScore: z.number().describe('A score from 0-100 based on resolution latency.'),
});

export type WeeklyInsightsInput = z.infer<typeof MetricSchema>;
export type WeeklyInsightsOutput = z.infer<typeof WeeklyInsightsOutputSchema>;

export async function generateWeeklyInsights(input: WeeklyInsightsInput): Promise<WeeklyInsightsOutput> {
  return generateWeeklyInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeeklyInsightsPrompt',
  input: { schema: MetricSchema },
  output: { schema: WeeklyInsightsOutputSchema },
  prompt: `You are a Senior Strategic Operations Analyst. Analyze the following support ticket data and provide a comprehensive Weekly Summary Insight.

METRICS:
- Total Tickets Processed: {{{totalTickets}}}
- Average Neural Latency: {{{avgResponseTime}}}s
- Departmental Load Distribution: 
  {{#each categoryDistribution}}
  * {{{@key}}}: {{{this}}} tickets
  {{/each}}

RECENT TICKET SAMPLES FOR PATTERN MATCHING:
{{#each recentTickets}}
- [DEPT: {{category}}]: "{{content}}"
{{/each}}

STRICT OUTPUT PROTOCOL:
1. Write a high-level summary insight that captures core performance.
2. Identify 3 positive trends.
3. Identify 3 yellow-flag patterns.
4. Highlight 3 red-flag concerns.
5. Provide 3 actionable strategic recommendations.
6. For EACH of the following keys in recurringIssuesByDept: "IT", "HR", "Finance", "Operations":
   - Analyze the ticket samples to identify exactly 3 recurring specific issues.
   - If there are no tickets for a specific department in the samples, provide 3 high-priority optimization goals based on industry standards for that department (e.g., for IT: "Enhance system uptime", "Optimize VPN performance", "Reduce password reset latency").
   - These MUST be strings.
7. Calculate a 0-100 efficiency score.

Tone: Data-driven, Strategic, Actionable.`,
});

const generateWeeklyInsightsFlow = ai.defineFlow(
  {
    name: 'generateWeeklyInsightsFlow',
    inputSchema: MetricSchema,
    outputSchema: WeeklyInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('AI failed to generate weekly insights.');
    return output;
  }
);
