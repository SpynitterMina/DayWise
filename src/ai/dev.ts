
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-day.ts';
import '@/ai/flows/suggest-task-ordering.ts';
// Removed: import '@/ai/flows/suggest-journal-prompts.ts';
// Removed: import '@/ai/flows/generate-motivational-quote.ts';

