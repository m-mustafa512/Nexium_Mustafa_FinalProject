import { ResumeContent, JobDescription } from '@/types';

export interface N8nWorkflowResponse {
  success: boolean;
  data?: {
    tailoredResume: ResumeContent;
    matchScore: number;
    suggestions: string[];
  };
  error?: string;
}

export interface N8nWorkflowPayload {
  originalResume: ResumeContent;
  jobDescription: JobDescription;
  template: 'modern' | 'minimalist' | 'creative';
}

class N8nClient {
  private baseUrl: string;
  private webhookToken: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'http://localhost:5678';
    this.webhookToken = process.env.NEXT_PUBLIC_N8N_WEBHOOK_TOKEN || '';
  }

  /**
   * Triggers the n8n workflow for resume tailoring
   */
  async tailorResume(payload: N8nWorkflowPayload): Promise<N8nWorkflowResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/tailor-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.webhookToken}`,
        },
        body: JSON.stringify({
          ...payload,
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        }),
      });

      if (!response.ok) {
        throw new Error(`N8n workflow failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return this.processN8nResponse(result);
    } catch (error) {
      console.error('N8n workflow error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Checks the status of a running workflow
   */
  async checkWorkflowStatus(executionId: string): Promise<{
    status: 'running' | 'success' | 'error' | 'waiting';
    progress?: number;
    result?: N8nWorkflowResponse;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/executions/${executionId}`, {
        headers: {
          'Authorization': `Bearer ${this.webhookToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check workflow status: ${response.status}`);
      }

      const execution = await response.json();
      
      return {
        status: execution.finished ? 
          (execution.stoppedAt ? 'success' : 'error') : 
          'running',
        progress: this.calculateProgress(execution),
        result: execution.finished ? this.processN8nResponse(execution.data) : undefined,
      };
    } catch (error) {
      console.error('Error checking workflow status:', error);
      return { status: 'error' };
    }
  }

  /**
   * Processes the raw n8n response into our expected format
   */
  private processN8nResponse(rawResponse: any): N8nWorkflowResponse {
    try {
      // Extract the tailored resume from n8n response
      const tailoredResume = rawResponse.tailoredResume || rawResponse.data?.tailoredResume;
      const matchScore = rawResponse.matchScore || rawResponse.data?.matchScore || 0;
      const suggestions = rawResponse.suggestions || rawResponse.data?.suggestions || [];

      if (!tailoredResume) {
        throw new Error('No tailored resume data received from n8n workflow');
      }

      return {
        success: true,
        data: {
          tailoredResume,
          matchScore,
          suggestions,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process n8n response',
      };
    }
  }

  /**
   * Calculates workflow progress based on execution data
   */
  private calculateProgress(execution: any): number {
    if (!execution.data || !execution.data.resultData) return 0;
    
    const nodes = execution.data.resultData.runData || {};
    const totalNodes = Object.keys(nodes).length;
    const completedNodes = Object.values(nodes).filter((node: any) => 
      node && node[0] && node[0].data
    ).length;
    
    return totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
  }

  /**
   * Generates a unique request ID for tracking
   */
  private generateRequestId(): string {
    return `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validates the payload before sending to n8n
   */
  private validatePayload(payload: N8nWorkflowPayload): boolean {
    if (!payload.originalResume || !payload.jobDescription) {
      return false;
    }

    if (!payload.originalResume.personalInfo?.name || !payload.originalResume.personalInfo?.email) {
      return false;
    }

    if (!payload.jobDescription.title || !payload.jobDescription.description) {
      return false;
    }

    return true;
  }
}

export const n8nClient = new N8nClient();