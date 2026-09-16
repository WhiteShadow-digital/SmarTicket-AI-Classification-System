'use server';

/**
 * @fileOverview Generates a summary of student performance using AI.
 *
 * - generateStudentPerformanceReport - A function that generates the student performance report.
 * - GenerateStudentPerformanceReportInput - The input type for the generateStudentPerformanceReport function.
 * - GenerateStudentPerformanceReportOutput - The return type for the generateStudentPerformanceReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudentPerformanceReportInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  grades: z.string().describe('The grades of the student in different subjects.'),
  attendancePercentage: z.number().describe('The attendance percentage of the student.'),
  teacherNotes: z.string().describe('Any notes from the teacher about the student.'),
});
export type GenerateStudentPerformanceReportInput = z.infer<
  typeof GenerateStudentPerformanceReportInputSchema
>;

const GenerateStudentPerformanceReportOutputSchema = z.object({
  report: z.string().describe('The generated student performance report.'),
});
export type GenerateStudentPerformanceReportOutput = z.infer<
  typeof GenerateStudentPerformanceReportOutputSchema
>;

export async function generateStudentPerformanceReport(
  input: GenerateStudentPerformanceReportInput
): Promise<GenerateStudentPerformanceReportOutput> {
  return generateStudentPerformanceReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudentPerformanceReportPrompt',
  input: {schema: GenerateStudentPerformanceReportInputSchema},
  output: {schema: GenerateStudentPerformanceReportOutputSchema},
  prompt: `You are an AI assistant that generates student performance reports for teachers.

  Based on the student's name, grades, attendance percentage, and teacher notes, generate a comprehensive summary of the student's performance.

  Student Name: {{{studentName}}}
  Grades: {{{grades}}}
  Attendance Percentage: {{{attendancePercentage}}}
  Teacher Notes: {{{teacherNotes}}}
  `,
});

const generateStudentPerformanceReportFlow = ai.defineFlow(
  {
    name: 'generateStudentPerformanceReportFlow',
    inputSchema: GenerateStudentPerformanceReportInputSchema,
    outputSchema: GenerateStudentPerformanceReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
