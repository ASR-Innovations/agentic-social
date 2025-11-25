import { Injectable, Logger } from '@nestjs/common';
import {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowContext,
  WorkflowStatus,
  ExecutionConstraints,
  IWorkflowOrchestrator,
} from '../interfaces/workflow.interface';
import { Agent, AgentResult, AgentTask } from '../interfaces/agent.interface';
import { AgentMemoryService } from '../memory/agent-memory.service';

/**
 * Orchestrator Service
 * 
 * Coordinates multiple agents to execute complex workflows.
 * Handles parallel execution, dependencies, and error recovery.
 */
@Injectable()
export class OrchestratorService implements IWorkflowOrchestrator {
  private readonly logger = new Logger(OrchestratorService.name);
  private readonly activeExecutions = new Map<string, WorkflowExecution>();
  private readonly agentRegistry = new Map<string, Agent>();

  constructor(private readonly memoryService: AgentMemoryService) {}

  /**
   * Register an agent with the orchestrator
   */
  registerAgent(agent: Agent): void {
    this.agentRegistry.set(agent.id, agent);
    this.logger.log(`Registered agent: ${agent.id} (${agent.type})`);
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId: string): void {
    this.agentRegistry.delete(agentId);
    this.logger.log(`Unregistered agent: ${agentId}`);
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflow: WorkflowDefinition,
    context: WorkflowContext,
    constraints?: ExecutionConstraints,
  ): Promise<WorkflowExecution> {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();

    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.id,
      status: WorkflowStatus.RUNNING,
      startedAt: new Date(),
      results: new Map(),
      totalCost: 0,
      totalDuration: 0,
    };

    this.activeExecutions.set(executionId, execution);
    this.logger.log(`Starting workflow execution: ${executionId}`);

    try {
      // Execute workflow steps
      if (workflow.parallelExecution) {
        await this.executeParallel(workflow, context, execution, constraints);
      } else {
        await this.executeSequential(workflow, context, execution, constraints);
      }

      execution.status = WorkflowStatus.COMPLETED;
      execution.completedAt = new Date();
      execution.totalDuration = Date.now() - startTime;

      this.logger.log(
        `Workflow completed: ${executionId} in ${execution.totalDuration}ms, cost: $${execution.totalCost.toFixed(4)}`,
      );
    } catch (error) {
      execution.status = WorkflowStatus.FAILED;
      execution.error = error.message;
      execution.completedAt = new Date();
      execution.totalDuration = Date.now() - startTime;

      this.logger.error(`Workflow failed: ${executionId} - ${error.message}`);
    }

    return execution;
  }

  /**
   * Execute steps in parallel
   */
  private async executeParallel(
    workflow: WorkflowDefinition,
    context: WorkflowContext,
    execution: WorkflowExecution,
    constraints?: ExecutionConstraints,
  ): Promise<void> {
    const stepPromises = workflow.steps.map(step =>
      this.executeStep(step.agentId, step.task, context, execution, constraints),
    );

    const results = await Promise.allSettled(stepPromises);

    // Check if any required steps failed
    results.forEach((result, index) => {
      if (result.status === 'rejected' && !workflow.steps[index].optional) {
        if (constraints?.stopOnFirstFailure) {
          throw new Error(`Required step failed: ${workflow.steps[index].id}`);
        }
      }
    });
  }

  /**
   * Execute steps sequentially
   */
  private async executeSequential(
    workflow: WorkflowDefinition,
    context: WorkflowContext,
    execution: WorkflowExecution,
    constraints?: ExecutionConstraints,
  ): Promise<void> {
    for (const step of workflow.steps) {
      try {
        // Check dependencies
        if (step.dependencies.length > 0) {
          const dependenciesMet = step.dependencies.every(depId =>
            execution.results.has(depId),
          );

          if (!dependenciesMet) {
            throw new Error(`Dependencies not met for step: ${step.id}`);
          }
        }

        // Execute step
        await this.executeStep(step.agentId, step.task, context, execution, constraints);
      } catch (error) {
        if (!step.optional && constraints?.stopOnFirstFailure) {
          throw error;
        }

        this.logger.warn(`Optional step failed: ${step.id} - ${error.message}`);
      }
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    agentId: string,
    task: AgentTask,
    context: WorkflowContext,
    execution: WorkflowExecution,
    constraints?: ExecutionConstraints,
  ): Promise<AgentResult> {
    const agent = this.agentRegistry.get(agentId);

    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Check cost constraint
    if (constraints?.maxCost && execution.totalCost >= constraints.maxCost) {
      throw new Error('Workflow cost limit exceeded');
    }

    // Check duration constraint
    if (constraints?.maxDuration) {
      const elapsed = Date.now() - execution.startedAt.getTime();
      if (elapsed >= constraints.maxDuration) {
        throw new Error('Workflow duration limit exceeded');
      }
    }

    // Add context from previous results
    task.context = {
      ...task.context,
      tenantId: context.tenantId,
      userId: context.userId,
      previousResults: Object.fromEntries(execution.results),
      sharedMemory: context.sharedState,
    };

    // Execute agent task
    const result = await agent.execute(task);

    // Update execution
    execution.results.set(task.id, result);
    execution.totalCost += result.metadata.cost;

    // Store result in shared state
    context.sharedState[task.id] = result.output;

    return result;
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<WorkflowExecution> {
    const execution = this.activeExecutions.get(executionId);

    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    return execution;
  }

  /**
   * Cancel a running workflow
   */
  async cancelWorkflow(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);

    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    if (execution.status === WorkflowStatus.RUNNING) {
      execution.status = WorkflowStatus.CANCELLED;
      execution.completedAt = new Date();
      this.logger.log(`Cancelled workflow: ${executionId}`);
    }
  }

  /**
   * Retry a failed workflow
   */
  async retryWorkflow(executionId: string): Promise<WorkflowExecution> {
    const originalExecution = this.activeExecutions.get(executionId);

    if (!originalExecution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    // Create new execution with same workflow
    // Implementation would retrieve original workflow and context
    throw new Error('Retry not yet implemented');
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up completed executions
   */
  async cleanupExecutions(olderThan: Date): Promise<number> {
    let cleaned = 0;

    for (const [id, execution] of this.activeExecutions) {
      if (
        execution.completedAt &&
        execution.completedAt < olderThan &&
        execution.status !== WorkflowStatus.RUNNING
      ) {
        this.activeExecutions.delete(id);
        cleaned++;
      }
    }

    this.logger.log(`Cleaned up ${cleaned} old executions`);
    return cleaned;
  }

  /**
   * Get active executions count
   */
  getActiveExecutionsCount(): number {
    let count = 0;
    for (const execution of this.activeExecutions.values()) {
      if (execution.status === WorkflowStatus.RUNNING) {
        count++;
      }
    }
    return count;
  }
}
