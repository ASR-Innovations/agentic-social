import { Injectable } from '@nestjs/common';
import {
  WorkflowDefinition,
  WorkflowStep,
  IWorkflowBuilder,
  StepOptions,
  ExecutionConstraints,
} from '../interfaces/workflow.interface';
import { AgentTask } from '../interfaces/agent.interface';

/**
 * Workflow Builder
 * 
 * Fluent API for building complex multi-agent workflows.
 */
@Injectable()
export class WorkflowBuilder implements IWorkflowBuilder {
  private workflow: Partial<WorkflowDefinition>;
  private steps: WorkflowStep[] = [];
  private stepCounter = 0;

  /**
   * Create a new workflow
   */
  createWorkflow(name: string, description: string): IWorkflowBuilder {
    this.workflow = {
      id: this.generateWorkflowId(),
      name,
      description,
      steps: [],
      parallelExecution: false,
    };
    this.steps = [];
    this.stepCounter = 0;

    return this;
  }

  /**
   * Add a step to the workflow
   */
  addStep(agentId: string, task: AgentTask, options?: StepOptions): IWorkflowBuilder {
    const step: WorkflowStep = {
      id: `step_${++this.stepCounter}`,
      agentId,
      task,
      dependencies: options?.dependencies || [],
      optional: options?.optional || false,
      retryOnFailure: options?.retryOnFailure !== false,
      maxRetries: options?.maxRetries || 3,
    };

    this.steps.push(step);
    return this;
  }

  /**
   * Add parallel steps
   */
  addParallelSteps(steps: Array<{ agentId: string; task: AgentTask }>): IWorkflowBuilder {
    this.workflow.parallelExecution = true;

    steps.forEach(({ agentId, task }) => {
      this.addStep(agentId, task);
    });

    return this;
  }

  /**
   * Set workflow constraints
   */
  setConstraints(constraints: ExecutionConstraints): IWorkflowBuilder {
    this.workflow.maxCost = constraints.maxCost;
    this.workflow.maxDuration = constraints.maxDuration;
    return this;
  }

  /**
   * Build the workflow definition
   */
  build(): WorkflowDefinition {
    if (!this.workflow.id || !this.workflow.name) {
      throw new Error('Workflow must have id and name');
    }

    this.workflow.steps = this.steps;

    return this.workflow as WorkflowDefinition;
  }

  /**
   * Generate unique workflow ID
   */
  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Helper: Create a content generation workflow
   */
  static createContentGenerationWorkflow(
    contentCreatorId: string,
    strategyAgentId?: string,
  ): WorkflowDefinition {
    const builder = new WorkflowBuilder();

    builder.createWorkflow(
      'Content Generation',
      'Generate optimized content for social media',
    );

    // If strategy agent is provided, use it first
    if (strategyAgentId) {
      builder.addStep(strategyAgentId, {
        id: 'strategy',
        type: 'analyze_strategy',
        input: {},
      });

      builder.addStep(
        contentCreatorId,
        {
          id: 'content',
          type: 'generate_content',
          input: {},
        },
        {
          dependencies: ['step_1'], // Depends on strategy
        },
      );
    } else {
      builder.addStep(contentCreatorId, {
        id: 'content',
        type: 'generate_content',
        input: {},
      });
    }

    return builder.build();
  }

  /**
   * Helper: Create an autonomous posting workflow
   */
  static createAutonomousPostingWorkflow(
    contentCreatorId: string,
    strategyAgentId: string,
    trendDetectionId?: string,
  ): WorkflowDefinition {
    const builder = new WorkflowBuilder();

    builder.createWorkflow(
      'Autonomous Posting',
      'Fully autonomous content generation and posting',
    );

    // Step 1: Detect trends (optional)
    if (trendDetectionId) {
      builder.addStep(
        trendDetectionId,
        {
          id: 'trends',
          type: 'detect_trends',
          input: {},
        },
        { optional: true },
      );
    }

    // Step 2: Analyze strategy
    builder.addStep(strategyAgentId, {
      id: 'strategy',
      type: 'recommend_strategy',
      input: {},
    });

    // Step 3: Generate content
    builder.addStep(
      contentCreatorId,
      {
        id: 'content',
        type: 'generate_content',
        input: {},
      },
      {
        dependencies: ['step_2'], // Depends on strategy
      },
    );

    return builder.build();
  }
}
