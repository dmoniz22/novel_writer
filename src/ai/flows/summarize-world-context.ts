'use server';

/**
 * @fileOverview Summarizes world context document into key concepts and elements.
 *
 * - summarizeWorldContext - A function that summarizes the world context.
 * - SummarizeWorldContextInput - The input type for the summarizeWorldContext function.
 * - SummarizeWorldContextOutput - The return type for the summarizeWorldContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeWorldContextInputSchema = z.object({
  worldContext: z
    .string()
    .describe('A large document containing worldbuilding context.'),
});
export type SummarizeWorldContextInput = z.infer<typeof SummarizeWorldContextInputSchema>;

const SummarizeWorldContextOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summary of the key concepts and elements from the world context.'),
});
export type SummarizeWorldContextOutput = z.infer<typeof SummarizeWorldContextOutputSchema>;

export async function summarizeWorldContext(
  input: SummarizeWorldContextInput
): Promise<SummarizeWorldContextOutput> {
  return summarizeWorldContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeWorldContextPrompt',
  input: {schema: SummarizeWorldContextInputSchema},
  output: {schema: SummarizeWorldContextOutputSchema},
  prompt: `You are an expert worldbuilding assistant.  Please summarize the following world context into key concepts and elements that can be used for chapter generation.

World Context: {{{worldContext}}}`,
});

const summarizeWorldContextFlow = ai.defineFlow(
  {
    name: 'summarizeWorldContextFlow',
    inputSchema: SummarizeWorldContextInputSchema,
    outputSchema: SummarizeWorldContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
