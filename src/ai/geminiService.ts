import { ResumeContent, JobDescription } from '@/types';
import { TailoringOptions, TailoringResult } from './resumeTailoring';

export interface GeminiResponse {
  success: boolean;
  data?: TailoringResult;
  error?: string;
}

class GeminiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  /**
   * Tailors resume using Gemini API
   */
  async tailorResume(
    originalResume: ResumeContent,
    jobDescription: JobDescription,
    options: TailoringOptions
  ): Promise<GeminiResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Gemini API key not configured',
      };
    }

    try {
      const prompt = this.buildTailoringPrompt(originalResume, jobDescription, options);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return this.processGeminiResponse(result, originalResume, jobDescription);
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Builds the prompt for Gemini API
   */
  private buildTailoringPrompt(
    originalResume: ResumeContent,
    jobDescription: JobDescription,
    options: TailoringOptions
  ): string {
    return `
You are an expert resume writer and career coach. Your task is to tailor a resume for a specific job application.

ORIGINAL RESUME:
Name: ${originalResume.personalInfo.name}
Email: ${originalResume.personalInfo.email}
Phone: ${originalResume.personalInfo.phone}
Location: ${originalResume.personalInfo.location}
LinkedIn: ${originalResume.personalInfo.linkedin || 'Not provided'}
Portfolio: ${originalResume.personalInfo.portfolio || 'Not provided'}

Summary: ${originalResume.summary}

Experience:
${originalResume.experience.map(exp => `
- ${exp.title} at ${exp.company} (${exp.duration})
  Location: ${exp.location}
  Achievements:
  ${exp.achievements.map(achievement => `  • ${achievement}`).join('\n')}
`).join('\n')}

Education:
${originalResume.education.map(edu => `
- ${edu.degree} from ${edu.school} (${edu.year})
  Location: ${edu.location}
`).join('\n')}

Skills: ${originalResume.skills.join(', ')}

TARGET JOB:
Title: ${jobDescription.title}
Company: ${jobDescription.company || 'Not specified'}
Description: ${jobDescription.description}
Requirements: ${jobDescription.requirements?.join(', ') || 'Not specified'}

TAILORING OPTIONS:
Template: ${options.template}
Focus Areas: ${options.focusAreas.join(', ')}
Industry Keywords: ${options.industryKeywords.join(', ')}
Optimize for ATS: ${options.optimizeForATS}

INSTRUCTIONS:
1. Tailor the resume to match the job requirements while keeping all information truthful
2. Optimize the professional summary to highlight relevant experience for this specific role
3. Reorder and enhance experience bullet points to emphasize achievements relevant to the target job
4. Adjust skills section to prioritize skills mentioned in the job description
5. Use keywords from the job description naturally throughout the resume
6. Maintain the original structure but optimize content for maximum impact
7. Provide a match score (0-100) indicating how well the tailored resume matches the job
8. Suggest 3-5 specific improvements
9. List keyword matches found between the resume and job description

Please respond with a JSON object in the following format:
{
  "tailoredResume": {
    "personalInfo": {
      "name": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "linkedin": "string",
      "portfolio": "string"
    },
    "summary": "string",
    "experience": [
      {
        "title": "string",
        "company": "string",
        "location": "string",
        "duration": "string",
        "achievements": ["string"]
      }
    ],
    "education": [
      {
        "degree": "string",
        "school": "string",
        "location": "string",
        "year": "string"
      }
    ],
    "skills": ["string"]
  },
  "matchScore": number,
  "suggestions": ["string"],
  "keywordMatches": ["string"],
  "improvementAreas": ["string"]
}

Ensure the response is valid JSON and all fields are properly filled.
`;
  }

  /**
   * Processes Gemini API response
   */
  private processGeminiResponse(
    response: any,
    originalResume: ResumeContent,
    jobDescription: JobDescription
  ): GeminiResponse {
    try {
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No response generated by Gemini');
      }

      const content = response.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Gemini response');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      // Validate the response structure
      if (!parsedResponse.tailoredResume || !parsedResponse.matchScore) {
        throw new Error('Invalid response structure from Gemini');
      }

      const tailoringResult: TailoringResult = {
        tailoredResume: parsedResponse.tailoredResume,
        matchScore: parsedResponse.matchScore,
        suggestions: parsedResponse.suggestions || [],
        keywordMatches: parsedResponse.keywordMatches || [],
        improvementAreas: parsedResponse.improvementAreas || [],
      };

      return {
        success: true,
        data: tailoringResult,
      };
    } catch (error) {
      console.error('Error processing Gemini response:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process Gemini response',
      };
    }
  }

  /**
   * Generates content suggestions using Gemini
   */
  async generateContentSuggestions(
    resumeSection: string,
    jobRequirements: string[]
  ): Promise<string[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const prompt = `
Given this resume section: "${resumeSection}"
And these job requirements: ${jobRequirements.join(', ')}

Suggest 3-5 specific improvements to better align this section with the job requirements.
Provide actionable, specific suggestions that maintain truthfulness.

Respond with a JSON array of strings: ["suggestion1", "suggestion2", ...]
`;

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 512,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const result = await response.json();
      const content = result.candidates[0].content.parts[0].text;
      
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];
    } catch (error) {
      console.error('Error generating content suggestions:', error);
      return [];
    }
  }

  /**
   * Extracts keywords from job description using Gemini
   */
  async extractJobKeywords(jobDescription: JobDescription): Promise<string[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const prompt = `
Extract the most important keywords and skills from this job description:

Title: ${jobDescription.title}
Description: ${jobDescription.description}
Requirements: ${jobDescription.requirements?.join(', ') || 'Not specified'}

Focus on:
- Technical skills and technologies
- Soft skills and competencies
- Industry-specific terms
- Qualifications and certifications
- Tools and platforms

Return a JSON array of the top 20 most relevant keywords: ["keyword1", "keyword2", ...]
`;

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 512,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const result = await response.json();
      const content = result.candidates[0].content.parts[0].text;
      
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];
    } catch (error) {
      console.error('Error extracting job keywords:', error);
      return [];
    }
  }
}

export const geminiService = new GeminiService();