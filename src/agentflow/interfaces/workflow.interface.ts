/**
 * Workflow Interface
 * 
 * Defines how multiple agents work together to complete complex tasks.
 */

import { Agent, AgentTask, AgentResult } from './agent.interface';

export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  task: AgentTask;
  dependencies: string[]; // IDs of steps that must complete first
  optional: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  parallelExecution: boolean;
  maxDuration?: number;
  maxCost?: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  startedAt: Date;
  completedAt?: Date;
  results: Map<string, AgentResult>;
  totalCost: number;
  totalDuration: number;
  error?: string;
}

export interface WorkflowContext {
  tenantId: string;
  userId: string;
  input: Record<string, any>;
  sharedState: Record<string, any>;
}

export interface ExecutionConstraints {
  maxCost?: number;
  maxDuration?: number;
  qualityThreshold?: number;
  stopOnFirstFailure?: boolean;
}

/**
 * Workflow Builder Interface
 */
export interface IWorkflowBuilder {
  /**
   * Create a new workflow
   */
  createWorkflow(name: string, description: string): IWorkflowBuilder;

  /**
   * Add a step to the workflow
   */
  addStep(agentId: string, task: AgentTask, options?: StepOptions): IWorkflowBuilder;

  /**
   * Add parallel steps
   */
  addParallelSteps(steps: Array<{ agentId: string; task: AgentTask }>): IWorkflowBuilder;

  /**
   * Set workflow constraints
   */
  setConstraints(constraints: ExecutionConstraints): IWorkflowBuilder;

  /**
   * Build the workflow definition
   */
  build(): WorkflowDefinition;
}

export interface StepOptions {
  dependencies?: string[];
  optional?: boolean;
  retryOnFailure?: boolean;
  maxRetries?: number;
}

/**
 * Workflow Orchestrator Interface
 */
export interface IWorkflowOrchestrator {
  /**
   * Execute a workflow
   */
  executeWorkflow(
    workflow: WorkflowDefinition,
    context: WorkflowContext,
    constraints?: ExecutionConstraints,
  ): Promise<WorkflowExecution>;

  /**
   * Get workflow execution status
   */
  getExecutionStatus(executionId: string): Promise<WorkflowExecution>;

  /**
   * Cancel a running workflow
   */
  cancelWorkflow(executionId: string): Promise<void>;

  /**
   * Retry a failed workflow
   */
  retryWorkflow(executionId: string): Promise<WorkflowExecution>;
}

/**
 * Agent Coordination
 */
export interface CoordinationMessage {
  from: string;
  to: string;
  type: 'context' | 'result' | 'request' | 'notification';
  payload: any;
  timestamp: Date;
}

export interface CoordinationChannel {
  id: string;
  participants: string[];
  messages: CoordinationMessage[];
}
