'use server';

/**
 * @fileOverview Summarizes the day's accomplishments for the user.
 *
 * - summarizeDay - A function that summarizes the day's tasks.
 * - SummarizeDayInput - The input type for the summarizeDay function.
 * - SummarizeDayOutput - The return type for the summarizeDay function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDayInputSchema = z.object({
  tasks: z
    .array(
      z.object({
        description: z.string(),
        completed: z.boolean(),
      })
    )
    .describe('A list of tasks completed during the day.'),
});

export type SummarizeDayInput = z.infer<typeof SummarizeDayInputSchema>;

const SummarizeDayOutputSchema = z.object({
  summary: z.string().describe('A summary of the day\'s accomplishments.'),
  areasForImprovement: z
    .string()
    .describe('Areas where the user could improve their productivity.'),
});

export type SummarizeDayOutput = z.infer<typeof SummarizeDayOutputSchema>;

export async function summarizeDay(input: SummarizeDayInput): Promise<SummarizeDayOutput> {
  return summarizeDayFlow(input);
}

const summarizeDayPrompt = ai.definePrompt({
  name: 'summarizeDayPrompt',
  input: {schema: SummarizeDayInputSchema},
  output: {schema: SummarizeDayOutputSchema},
  prompt: `Summarize the day's accomplishments based on the completed tasks.
\nCompleted Tasks:\n{{#each tasks}}
{{#if completed}}
- {{description}}\n{{/if}}
{{/each}}
\nSuggest areas for improvement based on the tasks that were not completed.
\nUncompleted Tasks:\n{{#each tasks}}
{{#if (not completed)}}
- {{description}}\n{{/if}}
{{/each}}`,
});

const summarizeDayFlow = ai.defineFlow(
  {
    name: 'summarizeDayFlow',
    inputSchema: SummarizeDayInputSchema,
    outputSchema: SummarizeDayOutputSchema,
  },
  async input => {
    const {output} = await summarizeDayPrompt(input);
    return output!;
  }
);
