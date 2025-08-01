// Main AI module exports
export { n8nClient } from './n8nClient';
export { geminiService } from './geminiService';
export { resumeTailoringService } from './resumeTailoring';
export { workflowManager } from './workflowManager';

export type {
  N8nWorkflowResponse,
  N8nWorkflowPayload,
} from './n8nClient';

export type {
  GeminiResponse,
} from './geminiService';

export type {
  TailoringOptions,
  TailoringResult,
} from './resumeTailoring';

export type {
  WorkflowStatus,
  WorkflowRequest,
} from './workflowManager';

// Utility functions
export const createTailoringOptions = (
  template: 'modern' | 'minimalist' | 'creative',
  focusAreas: string[] = [],
  industryKeywords: string[] = [],
  optimizeForATS: boolean = true
): TailoringOptions => ({
  template,
  focusAreas,
  industryKeywords,
  optimizeForATS,
});

export const isWorkflowComplete = (status: string): boolean => {
  return status === 'completed' || status === 'failed';
};

export const getWorkflowProgressMessage = (progress: number): string => {
  if (progress < 20) return 'Analyzing job requirements...';
  if (progress < 40) return 'Matching your experience...';
  if (progress < 60) return 'Optimizing keywords...';
  if (progress < 80) return 'Restructuring content...';
  if (progress < 100) return 'Final optimization...';
  return 'Complete!';
};