'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating chapter text based on a book outline and worldbuilding context.
 *
 * - generateChapterText - A function that generates chapter text.
 * - GenerateChapterTextInput - The input type for the generateChapterText function.
 * - GenerateChapterTextOutput - The return type for the generateChapterText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChapterTextInputSchema = z.object({
  seriesOutline: z
    .string()
    .describe('The outline of the entire book series.'),
  worldbuildingInformation: z
    .string()
    .describe('Information about the world in which the story takes place.'),
  bookOutline: z.string().describe('A detailed outline of the current book.'),
  chapterOutline: z.string().describe('A detailed outline of the chapter.'),
  chapterLength: z
    .string()
    .optional()
    .describe('The estimated length of the chapter (e.g., "3000 words", "10 pages").'),
  writingStyle: z
    .string()
    .optional()
    .describe('A list of authors or styles to emulate (e.g., "J.R.R. Tolkien, Brandon Sanderson").'),
});
export type GenerateChapterTextInput = z.infer<typeof GenerateChapterTextInputSchema>;

const GenerateChapterTextOutputSchema = z.object({
  chapterText: z.string().describe('The generated text for the chapter.'),
});
export type GenerateChapterTextOutput = z.infer<typeof GenerateChapterTextOutputSchema>;

export async function generateChapterText(
  input: GenerateChapterTextInput
): Promise<GenerateChapterTextOutput> {
  return generateChapterTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChapterTextPrompt',
  input: {schema: GenerateChapterTextInputSchema},
  output: {schema: GenerateChapterTextOutputSchema},
  prompt: `You are a fantasy novel writer helping a user draft their next chapter.

  Use the following information to generate the chapter text:

  Series Outline: {{{seriesOutline}}}
  Worldbuilding Information: {{{worldbuildingInformation}}}
  Book Outline: {{{bookOutline}}}
  Chapter Outline: {{{chapterOutline}}}
  {{#if chapterLength}}
  Target Chapter Length: {{{chapterLength}}}
  {{/if}}
  {{#if writingStyle}}
  Emulate the writing style of: {{{writingStyle}}}
  {{/if}}

  Write the chapter text.`,
});

const generateChapterTextFlow = ai.defineFlow(
  {
    name: 'generateChapterTextFlow',
    inputSchema: GenerateChapterTextInputSchema,
    outputSchema: GenerateChapterTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
