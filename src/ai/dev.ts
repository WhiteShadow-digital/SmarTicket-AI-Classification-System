import { config } from 'dotenv';
config();

import '@/ai/flows/process-ticket-flow.ts';
import '@/ai/flows/generate-weekly-insights.ts';
import '@/ai/flows/generate-department-summary.ts';
