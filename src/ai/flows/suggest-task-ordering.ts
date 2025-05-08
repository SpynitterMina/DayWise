'use server';

/**
 * @fileOverview Suggests an optimal ordering of tasks for the user's daily schedule based on task descriptions and estimated completion times.
 *
 * - suggestTaskOrdering - A function that suggests an ordering of tasks.
 * - Task - The TypeScript type for a single task.
 * - SuggestTaskOrderingInput - The TypeScript type for the input to the suggestTaskOrdering function.
 * - SuggestTaskOrderingOutput - The TypeScript type for the return type of the suggestTaskOrdering function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSchema = z.object({
  id: z.string().describe('A unique identifier for the task.'),
  description: z.string().describe('A detailed description of the task.'),
  estimatedTime: z.number().describe('The estimated time in minutes to complete the task.'),
});

export type Task = z.infer<typeof TaskSchema>;

const SuggestTaskOrderingInputSchema = z.object({
  tasks: z.array(TaskSchema).min(1,"At least one task is required to suggest an order.").describe('An array of tasks to be ordered. Should not be empty.'),
});

export type SuggestTaskOrderingInput = z.infer<typeof SuggestTaskOrderingInputSchema>;

const SuggestTaskOrderingOutputSchema = z.array(TaskSchema).describe("An array of tasks in the suggested order. Can be empty if no suitable ordering is found or an error occurs.");

export type SuggestTaskOrderingOutput = z.infer<typeof SuggestTaskOrderingOutputSchema>;

export async function suggestTaskOrdering(input: SuggestTaskOrderingInput): Promise<SuggestTaskOrderingOutput> {
  const inputValidation = SuggestTaskOrderingInputSchema.safeParse(input);
  if (!inputValidation.success) {
    console.warn("suggestTaskOrdering called with invalid input:", inputValidation.error.flatten());
    return []; 
  }

  try {
    const result = await suggestTaskOrderingFlow(inputValidation.data);
    // Validate the output from the flow
    const outputValidation = SuggestTaskOrderingOutputSchema.safeParse(result);
    if (!outputValidation.success) {
        console.error("Invalid output from suggestTaskOrderingFlow:", outputValidation.error.flatten());
        return []; // Return empty array on invalid output
    }
    return outputValidation.data;
  } catch (error) {
    console.error("Error in suggestTaskOrdering flow execution:", error);
    return [];
  }
}

const prompt = ai.definePrompt({
  name: 'suggestTaskOrderingPrompt',
  input: {schema: SuggestTaskOrderingInputSchema},
  output: {schema: SuggestTaskOrderingOutputSchema}, // AI should attempt to match this schema
  prompt: `You are an AI assistant that helps users plan their day by suggesting an optimal ordering of tasks.
  Consider the task descriptions and estimated completion times to suggest an order that maximizes productivity and minimizes context switching.
  Prioritize more demanding or important tasks earlier if possible. Group similar tasks together.

  Here are the tasks:
  {{#each tasks}}
  - ID: {{this.id}}, Description: {{this.description}}, Estimated Time: {{this.estimatedTime}} minutes
  {{/each}}

  Return ONLY the tasks in the suggested order as a JSON array. The array should contain objects with "id", "description", and "estimatedTime" fields.
  Do not add any additional commentary, intro, or outro. Just the JSON array.
  If no reordering is beneficial or tasks are already well-ordered, return the original tasks in the same order.
  If for some reason you cannot process the request, return an empty JSON array: [].
  `,
});

const suggestTaskOrderingFlow = ai.defineFlow(
  {
    name: 'suggestTaskOrderingFlow',
    inputSchema: SuggestTaskOrderingInputSchema,
    outputSchema: SuggestTaskOrderingOutputSchema, // The flow itself also validates against this schema
  },
  async (input) : Promise<SuggestTaskOrderingOutput>=> {
    const {output} = await prompt(input);
    // The output from prompt is already parsed by Genkit against the prompt's output schema.
    // If parsing fails, Genkit might throw or return null/undefined.
    // The wrapper function `suggestTaskOrdering` handles final validation and error cases.
    return output || []; // Ensure it's an array, as schema expects.
  }
);
