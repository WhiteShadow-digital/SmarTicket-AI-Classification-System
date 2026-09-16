'use server';

/**
 * @fileOverview AI flow to analyze salon inventory and provide strategic insights.
 * 
 * - generateInventoryInsight - Orchestrates the analysis.
 * - InventoryInsightInput - Schema for product and transaction data.
 * - InventoryInsightOutput - Structured recommendations and warnings.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InventoryInsightInputSchema = z.object({
  inventoryJson: z.string().describe('JSON string representing the current product catalog.'),
  recentTransactionsJson: z.string().describe('JSON string representing recent stock movements.'),
});
export type InventoryInsightInput = z.infer<typeof InventoryInsightInputSchema>;

const InventoryInsightOutputSchema = z.object({
  overallStatus: z.string().describe('High-level summary of inventory health.'),
  criticalActions: z.array(z.string()).describe('List of urgent restocks or corrections needed.'),
  overstockWarnings: z.array(z.string()).describe('List of products that are overstocked and tying up capital.'),
  efficiencyTip: z.string().describe('A pro-tip for improving salon operations based on data.'),
});
export type InventoryInsightOutput = z.infer<typeof InventoryInsightOutputSchema>;

export async function generateInventoryInsight(input: InventoryInsightInput): Promise<InventoryInsightOutput> {
  return inventoryInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'inventoryInsightPrompt',
  input: { schema: InventoryInsightInputSchema },
  output: { schema: InventoryInsightOutputSchema },
  prompt: `You are a specialist inventory consultant for high-end hair salons. 
Analyze the provided inventory data and transaction history to provide professional, actionable insights.

Current Inventory:
{{{inventoryJson}}}

Recent Activity:
{{{recentTransactionsJson}}}

Focus on optimizing cash flow by identifying items that are moving fast (need restock) and items that are sitting too long. Keep the tone professional, encouraging, and business-focused.`,
});

const inventoryInsightFlow = ai.defineFlow(
  {
    name: 'inventoryInsightFlow',
    inputSchema: InventoryInsightInputSchema,
    outputSchema: InventoryInsightOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('AI failed to generate inventory insights.');
    return output;
  }
);
