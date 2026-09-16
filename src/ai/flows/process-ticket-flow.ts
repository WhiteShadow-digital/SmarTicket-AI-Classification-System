
'use server';

/**
 * @fileOverview Deterministic AI flow to classify tickets using high-accuracy rules.
 * Optimized for robustness and strict JSON schema adherence.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProcessTicketInputSchema = z.object({
  content: z.string().describe('The complaint or request text from the user.'),
});
export type ProcessTicketInput = z.infer<typeof ProcessTicketInputSchema>;

const ProcessTicketOutputSchema = z.object({
  primaryDepartment: z.enum(['HR', 'IT', 'Operations', 'Finance']),
  secondaryDepartments: z.array(z.enum(['HR', 'IT', 'Operations', 'Finance'])),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']),
  tone: z.enum(['Friendly', 'Professional', 'Urgent', 'Immediate']),
  confidence: z.number().describe('Classification confidence score.'),
  summary: z.string().describe('A brief summary of the explicit issue.'),
  response: z.string().describe('A professional response addressing only the core issue(s).'),
});
export type ProcessTicketOutput = z.infer<typeof ProcessTicketOutputSchema>;

export async function processTicket(input: ProcessTicketInput): Promise<ProcessTicketOutput> {
  return processTicketFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processTicketPrompt',
  input: { schema: ProcessTicketInputSchema },
  output: { schema: ProcessTicketOutputSchema },
  prompt: `
You are SmartTicket AI, an enterprise classification engine. Your ONLY goal is high-accuracy classification and response generation based EXCLUSIVELY on the user's input.

==================================================
DETERMINISTIC RULES (MANDATORY)
==================================================
1. NEVER speculate. If a user doesn't mention a specific hardware, do NOT mention it.
2. NEVER assume facts not in evidence. 
3. Treat every ticket as a unique, independent data point.
4. If a complaint contains multiple issues, you MUST map it to ALL relevant departments in the secondaryDepartments array.
5. The PRIMARY DEPARTMENT is the team RESPONSIBLE FOR THE FIX.
6. The SECONDARY DEPARTMENT is the team AFFECTED BY THE ISSUE or who must verify data.

==================================================
DEPARTMENT RESOLUTION OWNERS
==================================================
- IT: Technical failures, database errors, system outages, software bugs, internet connectivity, and hardware repair. (e.g., "Database connection error" is an IT fix).
- FINANCE: Payroll processing, accounting reconciliation, invoice management, banking, and supplier payments.
- OPERATIONS: Facilities maintenance, equipment repairs, logistics, transport, and office infrastructure.
- HR: Leave requests, employee records, contracts, and disciplinary matters.

==================================================
STEP 1: ANALYZE RESOLUTION SOURCE
==================================================
Identify which team must take ACTION to repair or resolve the core issue.
Example: "Accounting system database error" 
Primary Owner: IT (Repairs the connection).
Secondary Impact: Finance (User of the system).

==================================================
OUTPUT FORMAT
==================================================
You must return a valid JSON object matching the provided schema. Ensure secondaryDepartments is ALWAYS an array, even if empty.

USER COMPLAINT:
"{{{content}}}"`,
});

const processTicketFlow = ai.defineFlow(
  {
    name: 'processTicketFlow',
    inputSchema: ProcessTicketInputSchema,
    outputSchema: ProcessTicketOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) throw new Error('AI returned null output during classification.');
      return output;
    } catch (error: any) {
      console.error("Genkit Flow Error:", error);
      throw error;
    }
  }
);
