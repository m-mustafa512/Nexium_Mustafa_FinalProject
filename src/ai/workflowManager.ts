import { ResumeContent, JobDescription } from '@/types';
import { n8nClient } from './n8nClient';
import { resumeTailoringService, TailoringOptions, TailoringResult } from './resumeTailoring';

export interface WorkflowStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  result?: TailoringResult;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowRequest {
  originalResume: ResumeContent;
  jobDescription: JobDescription;
  options: TailoringOptions;
  userId?: string;
}

class WorkflowManager {
  private workflows: Map<string, WorkflowStatus> = new Map();
  private readonly WORKFLOW_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  /**
   * Starts a new resume tailoring workflow
   */
  async startWorkflow(request: WorkflowRequest): Promise<string> {
    const workflowId = this.generateWorkflowId();
    
    // Initialize workflow status
    const workflow: WorkflowStatus = {
      id: workflowId,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.workflows.set(workflowId, workflow);
    
    // Start the workflow asynchronously
    this.executeWorkflow(workflowId, request).catch(error => {
      console.error(`Workflow ${workflowId} failed:`, error);
      this.updateWorkflowStatus(workflowId, {
        status: 'failed',
        error: error.message,
        updatedAt: new Date(),
      });
    });
    
    return workflowId;
  }

  /**
   * Gets the status of a workflow
   */
  getWorkflowStatus(workflowId: string): WorkflowStatus | null {
    return this.workflows.get(workflowId) || null;
  }

  /**
   * Gets all workflows for a user
   */
  getUserWorkflows(userId: string): WorkflowStatus[] {
    // In a real implementation, this would filter by userId
    return Array.from(this.workflows.values());
  }

  /**
   * Cancels a running workflow
   */
  cancelWorkflow(workflowId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || workflow.status === 'completed' || workflow.status === 'failed') {
      return false;
    }

    this.updateWorkflowStatus(workflowId, {
      status: 'failed',
      error: 'Workflow cancelled by user',
      updatedAt: new Date(),
    });

    return true;
  }

  /**
   * Cleans up old workflows
   */
  cleanupOldWorkflows(): void {
    const now = new Date();
    const cutoffTime = now.getTime() - (24 * 60 * 60 * 1000); // 24 hours ago

    for (const [workflowId, workflow] of this.workflows.entries()) {
      if (workflow.createdAt.getTime() < cutoffTime) {
        this.workflows.delete(workflowId);
      }
    }
  }

  /**
   * Executes the workflow
   */
  private async executeWorkflow(workflowId: string, request: WorkflowRequest): Promise<void> {
    try {
      // Update status to running
      this.updateWorkflowStatus(workflowId, {
        status: 'running',
        progress: 10,
        updatedAt: new Date(),
      });

      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.updateWorkflowStatus(workflowId, {
          status: 'failed',
          error: 'Workflow timeout',
          updatedAt: new Date(),
        });
      }, this.WORKFLOW_TIMEOUT);

      // Execute the tailoring process
      const result = await this.executeTailoringSteps(workflowId, request);

      // Clear timeout
      clearTimeout(timeoutId);

      // Update with final result
      this.updateWorkflowStatus(workflowId, {
        status: 'completed',
        progress: 100,
        result,
        updatedAt: new Date(),
      });

    } catch (error) {
      this.updateWorkflowStatus(workflowId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: new Date(),
      });
    }
  }

  /**
   * Executes the tailoring steps with progress updates
   */
  private async executeTailoringSteps(
    workflowId: string,
    request: WorkflowRequest
  ): Promise<TailoringResult> {
    const steps = [
      { name: 'Analyzing job requirements', progress: 20 },
      { name: 'Matching experience', progress: 40 },
      { name: 'Optimizing keywords', progress: 60 },
      { name: 'Restructuring content', progress: 80 },
      { name: 'Final optimization', progress: 95 },
    ];

    // Simulate step-by-step progress
    for (const step of steps) {
      this.updateWorkflowStatus(workflowId, {
        progress: step.progress,
        updatedAt: new Date(),
      });

      // Add realistic delay between steps
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    }

    // Execute the actual tailoring
    const result = await resumeTailoringService.tailorResume(
      request.originalResume,
      request.jobDescription,
      request.options
    );

    return result;
  }

  /**
   * Updates workflow status
   */
  private updateWorkflowStatus(workflowId: string, updates: Partial<WorkflowStatus>): void {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      Object.assign(workflow, updates);
      this.workflows.set(workflowId, workflow);
    }
  }

  /**
   * Generates a unique workflow ID
   */
  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gets workflow statistics
   */
  getWorkflowStats(): {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
  } {
    const workflows = Array.from(this.workflows.values());
    
    return {
      total: workflows.length,
      pending: workflows.filter(w => w.status === 'pending').length,
      running: workflows.filter(w => w.status === 'running').length,
      completed: workflows.filter(w => w.status === 'completed').length,
      failed: workflows.filter(w => w.status === 'failed').length,
    };
  }
}

export const workflowManager = new WorkflowManager();

// Clean up old workflows every hour
setInterval(() => {
  workflowManager.cleanupOldWorkflows();
}, 60 * 60 * 1000);